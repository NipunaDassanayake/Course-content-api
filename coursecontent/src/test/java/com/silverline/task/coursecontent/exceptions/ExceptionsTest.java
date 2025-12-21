package com.silverline.task.coursecontent.exceptions;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ExceptionsTest {

    @Test
    void testFileStorageException() {
        String msg = "File error";
        FileStorageException ex = new FileStorageException(msg);
        assertEquals(msg, ex.getMessage());
    }

    @Test
    void testResourceNotFoundException() {
        String msg = "Resource missing";
        ResourceNotFoundException ex = new ResourceNotFoundException(msg);
        assertEquals(msg, ex.getMessage());
    }
}