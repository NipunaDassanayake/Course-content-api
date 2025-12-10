package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.service.AiSummarizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class AiTestController {

    private final AiSummarizationService aiSummarizationService;

    public AiTestController(AiSummarizationService aiSummarizationService) {
        this.aiSummarizationService = aiSummarizationService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, String>> testSummary() {
        String sampleText = """
                This course introduces students to Spring Boot and React for building full-stack
                web applications. Topics include REST APIs, database integration, authentication,
                and deploying applications to the cloud.
                """;

        String summary = aiSummarizationService.generateSummary(sampleText);
        String keyPoints = aiSummarizationService.generateKeyPoints(sampleText);

        return ResponseEntity.ok(
                Map.of(
                        "summary", summary,
                        "keyPoints", keyPoints
                )
        );
    }
}
