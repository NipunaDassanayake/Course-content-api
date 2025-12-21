package com.silverline.task.coursecontent.service.impl;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FileTextExtractorImplTest {

    private final FileTextExtractorImpl extractor = new FileTextExtractorImpl();

    @Test
    void extractText_ShouldReturnEmpty_WhenBytesNull() {
        String result = extractor.extractText(null, "application/pdf", "test.pdf");
        assertEquals("", result);
    }

    @Test
    void extractText_ShouldReturnDescription_ForNonPdf() {
        byte[] dummyData = "image data".getBytes();
        String result = extractor.extractText(dummyData, "image/png", "photo.png");

        assertTrue(result.contains("This file is of type image/png"));
        assertTrue(result.contains("photo.png"));
    }

    // We skip actual PDF parsing test because it requires a valid PDF byte array
    // but we covered the "if/else" logic above.
}