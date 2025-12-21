package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.controller.dto.response.NotificationResponseDTO;
import com.silverline.task.coursecontent.model.*;
import com.silverline.task.coursecontent.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void createNotification_ShouldNotSave_IfRecipientIsActor() {
        // Arrange
        User user = new User();
        user.setId(1L);

        // Act
        notificationService.createNotification(user, user, new CourseContent(), NotificationType.LIKE);

        // Assert
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createNotification_ShouldSaveLikeNotification() {
        // Arrange
        User recipient = new User(); recipient.setId(1L);
        User actor = new User(); actor.setId(2L); actor.setName("John");
        CourseContent content = new CourseContent(); content.setFileName("Test.pdf");

        // Act
        notificationService.createNotification(recipient, actor, content, NotificationType.LIKE);

        // Assert
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();
        assertEquals("John liked your post: Test.pdf", saved.getMessage());
        assertEquals(NotificationType.LIKE, saved.getType());
    }

    @Test
    void getUserNotifications_ShouldMapToDto() {
        // Arrange
        User actor = new User();
        actor.setName("Actor");
        actor.setProfilePicture("img.jpg");

        CourseContent content = new CourseContent();
        content.setId(10L);

        Notification n = new Notification();
        n.setId(1L);
        n.setMessage("Msg");
        n.setActor(actor);
        n.setContent(content);
        n.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findByRecipientEmailOrderByCreatedAtDesc("test@email.com"))
                .thenReturn(List.of(n));

        // Act
        List<NotificationResponseDTO> result = notificationService.getUserNotifications("test@email.com");

        // Assert
        assertEquals(1, result.size());
        assertEquals("Actor", result.get(0).getActorName());
        assertEquals(10L, result.get(0).getContentId());
    }

    @Test
    void markAsRead_ShouldUpdateEntity() {
        // Arrange
        Notification n = new Notification();
        n.setRead(false);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));

        // Act
        notificationService.markAsRead(1L);

        // Assert
        assertTrue(n.isRead());
        verify(notificationRepository).save(n);
    }

    @Test
    void markAllAsRead_ShouldUpdateAll() {
        // Arrange
        Notification n1 = new Notification();
        Notification n2 = new Notification();
        when(notificationRepository.findByRecipientEmailOrderByCreatedAtDesc("test@email.com"))
                .thenReturn(List.of(n1, n2));

        // Act
        notificationService.markAllAsRead("test@email.com");

        // Assert
        assertTrue(n1.isRead());
        assertTrue(n2.isRead());
        verify(notificationRepository).saveAll(anyList());
    }

    @Test
    void getUnreadCount_ReturnsCount() {
        when(notificationRepository.countByRecipientEmailAndIsReadFalse("a@b.com")).thenReturn(5L);
        assertEquals(5L, notificationService.getUnreadCount("a@b.com"));
    }
}