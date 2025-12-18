package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.service.CourseContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://course-fronend.vercel.app"})
public class CourseContentController {

    private final CourseContentService courseContentService;

    // ✅ FIXED: Pass 'principal' to check for Likes
    @GetMapping
    public ResponseEntity<Page<CourseContentResponseDTO>> getAllContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {

        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(courseContentService.getAllContent(page, size, email));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadContent(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            Principal principal) {
        return ResponseEntity.ok(courseContentService.uploadFile(file, description, "http://localhost:8080", principal.getName()));
    }

    @PostMapping("/link")
    public ResponseEntity<?> uploadLink(@RequestBody Map<String, String> payload, Principal principal) {
        return ResponseEntity.ok(courseContentService.addLink(payload.get("url"), payload.get("description"), principal.getName()));
    }

    @GetMapping("/my-contents")
    public ResponseEntity<?> getMyContents(Principal principal) {
        return ResponseEntity.ok(courseContentService.getMyContents(principal.getName()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadContent(@PathVariable Long id) {
        var content = courseContentService.getContent(id);
        byte[] data = courseContentService.getFileData(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + content.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(content.getFileType()))
                .body(data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContent(@PathVariable Long id, Principal principal) {
        courseContentService.deleteContent(id, principal.getName());
        return ResponseEntity.ok("Content deleted successfully");
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getSummary(@PathVariable Long id) {
        var content = courseContentService.getById(id);
        if (content.getSummary() != null) {
            return ResponseEntity.ok(Map.of("summary", content.getSummary(), "keyPoints", content.getKeyPoints()));
        }
        return ResponseEntity.ok(Map.of("message", "No summary exists yet."));
    }

    @PostMapping("/{id}/summary/generate")
    public ResponseEntity<?> generateSummary(@PathVariable Long id) {
        return ResponseEntity.ok(courseContentService.generateAndSaveSummary(id));
    }
}