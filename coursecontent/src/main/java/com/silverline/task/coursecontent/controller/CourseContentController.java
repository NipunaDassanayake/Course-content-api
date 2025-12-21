package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.SummaryResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.service.CourseContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://course-fronend.vercel.app"})
public class CourseContentController {

    private final CourseContentService courseContentService;

    @GetMapping
    public ResponseEntity<Page<CourseContentResponseDTO>> getAllContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {

        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(courseContentService.getAllContent(page, size, email));
    }

    // ✅ FIXED: Return 'UploadResponseDTO' instead of '?'
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponseDTO> uploadContent(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            Principal principal) {
        return ResponseEntity.ok(courseContentService.uploadFile(file, description, "http://localhost:8080", principal.getName()));
    }

    // ✅ FIXED: Return 'UploadResponseDTO' instead of '?'
    @PostMapping("/link")
    public ResponseEntity<UploadResponseDTO> uploadLink(@RequestBody Map<String, String> payload, Principal principal) {
        return ResponseEntity.ok(courseContentService.addLink(payload.get("url"), payload.get("description"), principal.getName()));
    }

    // ✅ FIXED: Return 'List<CourseContentResponseDTO>' instead of '?'
    @GetMapping("/my-contents")
    public ResponseEntity<List<CourseContentResponseDTO>> getMyContents(Principal principal) {
        return ResponseEntity.ok(courseContentService.getMyContents(principal.getName()));
    }

    // ✅ FIXED: Return 'byte[]' for file downloads
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadContent(@PathVariable Long id) {
        var content = courseContentService.getContent(id);
        byte[] data = courseContentService.getFileData(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + content.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(content.getFileType()))
                .body(data);
    }

    // ✅ FIXED: Return 'String' for simple messages
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContent(@PathVariable Long id, Principal principal) {
        courseContentService.deleteContent(id, principal.getName());
        return ResponseEntity.ok("Content deleted successfully");
    }

    // ✅ FIXED: Return 'Map<String, Object>' for flexible JSON responses
    @GetMapping("/{id}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long id) {
        var content = courseContentService.getById(id);
        if (content.getSummary() != null) {
            return ResponseEntity.ok(Map.of("summary", content.getSummary(), "keyPoints", content.getKeyPoints()));
        }
        return ResponseEntity.ok(Map.of("message", "No summary exists yet."));
    }

    // ✅ FIXED: Return 'SummaryResponseDTO'
    @PostMapping("/{id}/summary/generate")
    public ResponseEntity<SummaryResponseDTO> generateSummary(@PathVariable Long id) {
        return ResponseEntity.ok(courseContentService.generateAndSaveSummary(id));
    }
}