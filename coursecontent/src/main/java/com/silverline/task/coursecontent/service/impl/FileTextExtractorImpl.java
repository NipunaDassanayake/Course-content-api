package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.service.FileTextExtractor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
public class FileTextExtractorImpl implements FileTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(FileTextExtractorImpl.class);

    @Override
    public String extractText(byte[] fileBytes, String fileType, String originalFileName) {
        if (fileBytes == null || fileBytes.length == 0) {
            log.warn("File bytes are empty for file: {}", originalFileName);
            return "";
        }

        if (fileType != null && fileType.toLowerCase().contains("pdf")) {
            return extractTextFromPdf(fileBytes, originalFileName);
        }

        // For now, we don't do real extraction for images/videos.
        // We just send a small description to Gemini.
        String safeName = (originalFileName != null) ? originalFileName : "file";
        return "This file is of type " + fileType +
                " with name " + safeName +
                ". Generate a short high-level description for a student.";
    }

    private String extractTextFromPdf(byte[] fileBytes, String originalFileName) {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(fileBytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            // Truncate to avoid sending huge text to Gemini
            int maxChars = 8000;
            if (text.length() > maxChars) {
                log.info("Truncating extracted PDF text for {} from {} to {} chars",
                        originalFileName, text.length(), maxChars);
                return text.substring(0, maxChars);
            }
            return text;
        } catch (IOException e) {
            log.error("Failed to extract text from PDF: {}. Error: {}", originalFileName, e.getMessage(), e);
            return "This is a PDF file named " + originalFileName +
                    ". Generate a short high-level description for a student based on typical course material.";
        }
    }
}
