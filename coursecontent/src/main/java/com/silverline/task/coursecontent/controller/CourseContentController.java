package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.SummaryResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.service.CourseContentService;
import lombok.RequiredArgsConstructor;
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
@CrossOrigin(origins = "http://localhost:5173")
public class CourseContentController {

    private final CourseContentService courseContentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponseDTO> uploadContent(
            @RequestParam("file") MultipartFile file,
            @RequestParam("description") String description,
            Principal principal) {

        // Construct the base URL for downloads
        String baseDownloadUrl = "http://localhost:8080";
        return ResponseEntity.ok(courseContentService.uploadFile(file, description, baseDownloadUrl, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<CourseContentResponseDTO>> getAllContents() {
        return ResponseEntity.ok(courseContentService.getAllContents());
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadContent(@PathVariable Long id) {
        byte[] data = courseContentService.getFileData(id);
        var content = courseContentService.getContent(id);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + content.getFileName() + "\"")
                .body(data);
    }

    // ✅ FIX: Update Delete to accept Principal (User Identity)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id, Principal principal) {
        // Pass the ID AND the User's Email to the service for verification
        courseContentService.deleteContent(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/summary")
    public ResponseEntity<SummaryResponseDTO> generateSummary(@PathVariable Long id) {
        return ResponseEntity.ok(courseContentService.generateAndSaveSummary(id));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<SummaryResponseDTO> getSummary(@PathVariable Long id) {
        var content = courseContentService.getById(id);
        if (content.getSummary() == null) {
            return ResponseEntity.ok(new SummaryResponseDTO(id, null, null));
        }
        return ResponseEntity.ok(new SummaryResponseDTO(id, content.getSummary(), content.getKeyPoints()));
    }

    @GetMapping("/my-contents")
    public ResponseEntity<List<CourseContentResponseDTO>> getMyContents(Principal principal) {
        return ResponseEntity.ok(courseContentService.getMyContents(principal.getName()));
    }

    @PostMapping("/link")
    public ResponseEntity<UploadResponseDTO> addLink(
            @RequestBody Map<String, String> payload,
            Principal principal
    ) {
        String url = payload.get("url");
        String description = payload.get("description");
        return ResponseEntity.ok(courseContentService.addLink(url, description, principal.getName()));
    }
}