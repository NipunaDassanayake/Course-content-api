package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.SummaryResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.service.CourseContentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/content")
@CrossOrigin(origins = "http://localhost:5173") // React dev
public class CourseContentController {

    private final CourseContentService courseContentService;

    public CourseContentController(CourseContentService courseContentService) {
        this.courseContentService = courseContentService;
    }

    @PostMapping
    public ResponseEntity<UploadResponseDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description, // ✅ Accept Description
            HttpServletRequest request,
            java.security.Principal principal
    ) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();

        // Pass description to service
        UploadResponseDTO dto = courseContentService.uploadFile(file, description, baseUrl, principal.getName());

        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CourseContentResponseDTO>> getAllContents() {
        return ResponseEntity.ok(courseContentService.getAllContents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseContentResponseDTO> getContent(@PathVariable Long id) {
        return ResponseEntity.ok(courseContentService.getContent(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        CourseContent content = courseContentService.getById(id);
        byte[] data = courseContentService.getFileData(id); // this reads from S3

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(content.getFileType()));
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(content.getFileName())
                        .build()
        );

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    //UPDATED: Delete with ownership check
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable Long id,
            java.security.Principal principal // Get logged in user
    ) {
        courseContentService.deleteContent(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/summary")
    public ResponseEntity<SummaryResponseDTO> generateSummary(@PathVariable Long id) {
        SummaryResponseDTO response = courseContentService.generateAndSaveSummary(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<SummaryResponseDTO> getSummary(@PathVariable Long id) {
        CourseContent content = courseContentService.getById(id);

        return ResponseEntity.ok(
                new SummaryResponseDTO(content.getId(), content.getSummary(), content.getKeyPoints())
        );
    }

    //  ✅ NEW: Endpoint for DASHBOARD (My Files Only)
    @GetMapping("/my")
    public ResponseEntity<List<CourseContentResponseDTO>> getMyContents(java.security.Principal principal) {
        return ResponseEntity.ok(courseContentService.getMyContents(principal.getName()));
    }
}