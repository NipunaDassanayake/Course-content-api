package com.silverline.task.coursecontent.service;

public interface AiSummarizationService {
    String generateSummary(String contentText);
    String generateKeyPoints(String contentText);
}
