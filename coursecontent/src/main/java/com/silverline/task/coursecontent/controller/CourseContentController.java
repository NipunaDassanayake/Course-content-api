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

import java.security.Principal; // ✅ Import this
import java.util.Map;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://course-fronend.vercel.app"})
public class CourseContentController {

    private final CourseContentService courseContentService;

    // 1. GET ALL (Feed) - Public, no user needed
    @GetMapping
    public ResponseEntity<Page<CourseContentResponseDTO>> getAllContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(courseContentService.getAllContent(page, size));
    }

    // 2. UPLOAD FILE - ✅ Fixed: Uses principal.getName() (Email)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadContent(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            Principal principal) { // ✅ Spring injects the logged-in user here

        return ResponseEntity.ok(courseContentService.uploadFile(
                file,
                description,
                "http://localhost:8080",
                principal.getName() // ✅ Passes Email, not Token
        ));
    }

    // 3. UPLOAD LINK - ✅ Fixed
    @PostMapping("/link")
    public ResponseEntity<?> uploadLink(@RequestBody Map<String, String> payload, Principal principal) {
        return ResponseEntity.ok(courseContentService.addLink(
                payload.get("url"),
                payload.get("description"),
                principal.getName() // ✅ Passes Email
        ));
    }

    // 4. MY CONTENTS - ✅ Fixed (This is why your dashboard was empty)
    @GetMapping("/my-contents")
    public ResponseEntity<?> getMyContents(Principal principal) {
        return ResponseEntity.ok(courseContentService.getMyContents(principal.getName()));
    }

    // 5. DOWNLOAD - Public
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadContent(@PathVariable Long id) {
        var content = courseContentService.getContent(id);
        byte[] data = courseContentService.getFileData(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + content.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(content.getFileType()))
                .body(data);
    }

    // 6. DELETE - ✅ Fixed
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContent(@PathVariable Long id, Principal principal) {
        courseContentService.deleteContent(id, principal.getName()); // ✅ Passes Email for ownership check
        return ResponseEntity.ok("Content deleted successfully");
    }

    // --- AI ENDPOINTS ---

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getSummary(@PathVariable Long id) {
        var content = courseContentService.getById(id);
        if (content.getSummary() != null) {
            return ResponseEntity.ok(Map.of(
                    "summary", content.getSummary(),
                    "keyPoints", content.getKeyPoints()
            ));
        }
        return ResponseEntity.ok(Map.of("message", "No summary exists yet."));
    }

    @PostMapping("/{id}/summary/generate")
    public ResponseEntity<?> generateSummary(@PathVariable Long id) {
        return ResponseEntity.ok(courseContentService.generateAndSaveSummary(id));
    }
}