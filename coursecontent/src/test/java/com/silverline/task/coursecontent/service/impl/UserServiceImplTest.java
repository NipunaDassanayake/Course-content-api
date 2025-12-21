package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.exceptions.ResourceNotFoundException;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.service.FileStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void updateProfilePicture_Success() {
        // Arrange
        String email = "test@test.com";
        MultipartFile file = mock(MultipartFile.class);
        User user = new User();
        user.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(fileStorageService.storeFile(file)).thenReturn("key123");
        when(fileStorageService.getPublicUrl("key123")).thenReturn("http://s3.com/key123");

        // Act
        String resultUrl = userService.updateProfilePicture(email, file);

        // Assert
        assertEquals("http://s3.com/key123", resultUrl);
        assertEquals("http://s3.com/key123", user.getProfilePicture()); // Verify entity updated
        verify(userRepository).save(user);
    }

    @Test
    void updateProfilePicture_ThrowsIfUserNotFound() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> userService.updateProfilePicture("wrong@email.com", mock(MultipartFile.class)));
    }
}