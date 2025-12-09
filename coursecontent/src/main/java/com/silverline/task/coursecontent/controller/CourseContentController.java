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
            HttpServletRequest request
    ) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        UploadResponseDTO dto = courseContentService.uploadFile(file, baseUrl);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        courseContentService.deleteContent(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }



    @PostMapping("/{id}/summary")
    public ResponseEntity<SummaryResponseDTO> generateSummary(@PathVariable Long id) {
        SummaryResponseDTO response = courseContentService.generateAndSaveSummary(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<SummaryResponseDTO> getSummary(@PathVariable Long id) {
        CourseContent content = courseContentService
                .getById(id); // make this method return entity or wrap

        return ResponseEntity.ok(
                new SummaryResponseDTO(content.getId(), content.getSummary(), content.getKeyPoints())
        );
    }
}