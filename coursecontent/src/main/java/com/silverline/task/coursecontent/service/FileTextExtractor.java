package com.silverline.task.coursecontent.service;



public interface FileTextExtractor {

    /**
     * Extracts readable text from file bytes.
     *
     * @param fileBytes        raw file content (e.g. PDF bytes from S3)
     * @param fileType         MIME type (e.g. application/pdf)
     * @param originalFileName original file name (for logging/debug)
     * @return extracted text (possibly truncated), never null (may be empty)
     */
    String extractText(byte[] fileBytes, String fileType, String originalFileName);
}
