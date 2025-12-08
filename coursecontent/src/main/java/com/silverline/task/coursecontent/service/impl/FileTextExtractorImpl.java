package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.service.FileTextExtractor;
import org.springframework.stereotype.Service;

@Service
public class FileTextExtractorImpl implements FileTextExtractor {

    @Override
    public String extractText(String filePath, String fileType) {
        // TODO: use Apache PDFBox or similar to extract real text
        // For now, return a simple stub
        return "Sample extracted text for file: " + filePath;
    }
}