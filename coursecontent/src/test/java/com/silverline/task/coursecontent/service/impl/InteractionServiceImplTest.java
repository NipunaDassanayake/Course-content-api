package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.controller.dto.response.CommentResponseDTO;
import com.silverline.task.coursecontent.model.*;
import com.silverline.task.coursecontent.repository.CommentRepository;
import com.silverline.task.coursecontent.repository.CourseContentRepository;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InteractionServiceImplTest {

    @Mock
    private CourseContentRepository contentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private InteractionServiceImpl interactionService;

    @Test
    void toggleLike_ShouldAddLike_AndNotify() {
        // Arrange
        User owner = new User(); owner.setId(1L);
        User liker = new User(); liker.setId(2L);

        CourseContent content = new CourseContent();
        content.setId(10L);
        content.setUser(owner);
        content.setLikes(new HashSet<>()); // Empty likes

        when(contentRepository.findById(10L)).thenReturn(Optional.of(content));
        when(userRepository.findByEmail("liker@test.com")).thenReturn(Optional.of(liker));

        // Act
        interactionService.toggleLike(10L, "liker@test.com");

        // Assert
        assertTrue(content.getLikes().contains(liker));
        verify(contentRepository).save(content);
        verify(notificationService).createNotification(eq(owner), eq(liker), eq(content), eq(NotificationType.LIKE));
    }

    @Test
    void toggleLike_ShouldRemoveLike_AndNotNotify() {
        // Arrange
        User owner = new User(); owner.setId(1L);
        User liker = new User(); liker.setId(2L);

        CourseContent content = new CourseContent();
        content.setUser(owner);
        content.setLikes(new HashSet<>());
        content.getLikes().add(liker); // Already liked

        when(contentRepository.findById(10L)).thenReturn(Optional.of(content));
        when(userRepository.findByEmail("liker@test.com")).thenReturn(Optional.of(liker));

        // Act
        interactionService.toggleLike(10L, "liker@test.com");

        // Assert
        assertFalse(content.getLikes().contains(liker));
        verify(contentRepository).save(content);
        verify(notificationService, never()).createNotification(any(), any(), any(), any());
    }

    @Test
    void addComment_Success() {
        // Arrange
        User commenter = new User(); commenter.setId(2L); commenter.setName("User2");
        User owner = new User(); owner.setId(1L);

        CourseContent content = new CourseContent();
        content.setUser(owner);

        Comment savedComment = new Comment();
        savedComment.setId(100L);
        savedComment.setText("Nice!");
        savedComment.setCreatedAt(LocalDateTime.now());

        when(contentRepository.findById(10L)).thenReturn(Optional.of(content));
        when(userRepository.findByEmail("commenter@test.com")).thenReturn(Optional.of(commenter));
        when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

        // Act
        CommentResponseDTO result = interactionService.addComment(10L, "Nice!", "commenter@test.com");

        // Assert
        assertEquals("Nice!", result.getText());
        verify(notificationService).createNotification(eq(owner), eq(commenter), eq(content), eq(NotificationType.COMMENT));
    }

    @Test
    void getComments_ReturnsList() {
        // Arrange
        User user = new User(); user.setName("Dave");
        Comment c = new Comment(); c.setId(1L); c.setText("Hi"); c.setUser(user);

        when(commentRepository.findByCourseContentIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(c));

        // Act
        List<CommentResponseDTO> result = interactionService.getComments(10L);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Dave", result.get(0).getUsername());
    }
}