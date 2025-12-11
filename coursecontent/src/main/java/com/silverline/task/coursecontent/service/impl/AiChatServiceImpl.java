package com.silverline.task.coursecontent.service.impl;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.silverline.task.coursecontent.exceptions.ResourceNotFoundException;
import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.repository.CourseContentRepository;
import com.silverline.task.coursecontent.service.AiChatService;
import com.silverline.task.coursecontent.service.FileStorageService;
import com.silverline.task.coursecontent.service.FileTextExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiChatServiceImpl implements AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatServiceImpl.class);

    // ✅ OPTION 1: Try the standard Flash model (Best balance of speed/free tier)
    private static final String MODEL_ID = "gemini-1.5-flash";

    // ⚠️ IF OPTION 1 GIVES A 404 ERROR, USE THIS FALLBACK:
    // private static final String MODEL_ID = "gemini-pro";
    private final CourseContentRepository repository;
    private final FileStorageService fileStorageService;
    private final FileTextExtractor fileTextExtractor;
    private final String apiKey;

    public AiChatServiceImpl(CourseContentRepository repository,
                             FileStorageService fileStorageService,
                             FileTextExtractor fileTextExtractor,
                             @Value("${gemini.api.key}") String apiKey) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
        this.fileTextExtractor = fileTextExtractor;
        this.apiKey = apiKey;
    }

    @Override
    public String askQuestion(Long contentId, String question) {
        log.info("Processing chat question for contentId: {}", contentId);

        // 1. Get file metadata
        CourseContent content = repository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + contentId));

        // 2. Read file from S3
        byte[] fileBytes = fileStorageService.readFile(content.getFileUrl());

        // 3. Extract Text
        String documentText = fileTextExtractor.extractText(
                fileBytes,
                content.getFileType(),
                content.getFileName()
        );

        // 4. Truncate text if too long
        if (documentText.length() > 50000) {
            log.debug("Document text too long, truncating to 50000 chars");
            documentText = documentText.substring(0, 50000);
        }

        // 5. Call Gemini
        try (Client client = Client.builder().apiKey(apiKey).build()) {
            String prompt = "You are a helpful teaching assistant. Use the following document content to answer the student's question.\n\n" +
                    "--- DOCUMENT START ---\n" +
                    documentText + "\n" +
                    "--- DOCUMENT END ---\n\n" +
                    "Question: " + question + "\n" +
                    "Answer (be concise and helpful):";

            GenerateContentResponse response = client.models.generateContent(MODEL_ID, prompt, null);
            return response.text();
        } catch (Exception e) {
            log.error("Error communicating with Gemini AI", e);
            // Return a friendly error message to the chat window
            return "I'm sorry, I encountered an error while analyzing the document (" + e.getMessage() + "). Please try again later.";
        }
    }
}