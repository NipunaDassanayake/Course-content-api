package com.silverline.task.coursecontent.service.impl;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.silverline.task.coursecontent.service.AiSummarizationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiSummarizationServiceImpl implements AiSummarizationService {

    private final Client client;
    private static final String MODEL_ID = "gemini-2.5-flash"; // or any valid Gemini model

    // 🔹 Spring will inject gemini.api.key from application.properties
    public AiSummarizationServiceImpl(@Value("${gemini.api.key}") String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "gemini.api.key is not set. Add it to application.properties or as an env var."
            );
        }

        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    @Override
    public String generateSummary(String contentText) {
        String safeText = truncate(contentText, 8000);

        String prompt =
                "You are an assistant that summarizes course materials for students.\n\n" +
                        "Content:\n" +
                        safeText + "\n\n" +
                        "Task: Write a clear, concise summary (4–6 sentences) suitable for a student " +
                        "who wants to quickly understand the main ideas.";

        GenerateContentResponse response =
                client.models.generateContent(MODEL_ID, prompt, null);

        return response.text();
    }

    @Override
    public String generateKeyPoints(String contentText) {
        String safeText = truncate(contentText, 8000);

        String prompt =
                "You are an assistant that extracts key bullet points from course materials.\n\n" +
                        "Content:\n" +
                        safeText + "\n\n" +
                        "Task: Return 3–7 short bullet points that capture the most important ideas. " +
                        "Format them as plain text starting each point with '- '.";

        GenerateContentResponse response =
                client.models.generateContent(MODEL_ID, prompt, null);

        return response.text();
    }

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() > maxChars ? text.substring(0, maxChars) : text;
    }
}
