package com.silverline.task.coursecontent.exceptions;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    @Test
    void handleFileStorage_ReturnsBadRequest() {
        // Arrange
        FileStorageException ex = new FileStorageException("File error");

        // Act
        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleFileStorage(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File error", response.getBody().get("message"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    void handleNotFound_ReturnsNotFound() {
        // Arrange
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");

        // Act
        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleNotFound(ex);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Not found", response.getBody().get("message"));
    }

    @Test
    void handleGeneric_ReturnsInternalServerError() {
        // Arrange
        Exception ex = new Exception("System crash");

        // Act
        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleGeneric(ex);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("System crash", response.getBody().get("message"));
    }
}