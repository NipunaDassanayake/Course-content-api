package com.silverline.task.coursecontent.service;

import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.exceptions.FileStorageException;
import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.CourseContentRepository;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.service.impl.CourseContentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Enables Mockito
class CourseContentServiceTest {

    @Mock
    private CourseContentRepository repository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private UserRepository userRepository;

    // Inject mocks into the real service implementation
    @InjectMocks
    private CourseContentServiceImpl courseContentService;

    @Test
    void uploadFile_Success() {
        // 1. Arrange (Prepare Data)
        String userEmail = "test@example.com";
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", "Hello World".getBytes()
        );
        User mockUser = new User();
        mockUser.setEmail(userEmail);

        CourseContent savedContent = new CourseContent();
        savedContent.setId(1L);
        savedContent.setFileName("test.pdf");
        savedContent.setFileType("application/pdf");
        savedContent.setFileSize(100L);

        // Define Mock Behavior
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(mockUser));
        when(fileStorageService.storeFile(file)).thenReturn("s3-key-123");
        when(repository.save(any(CourseContent.class))).thenReturn(savedContent);

        // 2. Act (Call the method)
        UploadResponseDTO response = courseContentService.uploadFile(
                file, "Description", "http://localhost:8080", userEmail
        );

        // 3. Assert (Verify results)
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("test.pdf", response.getFileName());

        // Verify that repository.save() was actually called once
        verify(repository, times(1)).save(any(CourseContent.class));
    }

    @Test
    void uploadFile_InvalidType_ThrowsException() {
        // Arrange: Use an unsupported file type (e.g., EXE)
        MockMultipartFile file = new MockMultipartFile(
                "file", "malware.exe", "application/x-msdownload", "bad code".getBytes()
        );

        // Act & Assert
        Exception exception = assertThrows(FileStorageException.class, () -> {
            courseContentService.uploadFile(file, "Desc", "url", "user@test.com");
        });

        assertTrue(exception.getMessage().contains("Invalid file type"));
        verify(repository, never()).save(any()); // Ensure nothing was saved to DB
    }
}