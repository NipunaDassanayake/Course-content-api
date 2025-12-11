package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.controller.dto.response.NotificationResponseDTO;
import com.silverline.task.coursecontent.model.*;
import com.silverline.task.coursecontent.repository.NotificationRepository;
import com.silverline.task.coursecontent.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(User recipient, User actor, CourseContent content, NotificationType type) {
        // Prevent notifying yourself
        if (recipient.getId().equals(actor.getId())) return;

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setActor(actor);
        notification.setContent(content);
        notification.setType(type);

        if (type == NotificationType.LIKE) {
            notification.setMessage(actor.getName() + " liked your post: " + content.getFileName());
        } else if (type == NotificationType.COMMENT) {
            notification.setMessage(actor.getName() + " commented on: " + content.getFileName());
        }

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponseDTO> getUserNotifications(String email) {
        // ✅ Map Entity -> DTO here
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private NotificationResponseDTO toDto(Notification entity) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(entity.getId());
        dto.setMessage(entity.getMessage());
        dto.setRead(entity.isRead());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setType(entity.getType());

        if (entity.getActor() != null) {
            // Use Name if available, else Email
            String name = (entity.getActor().getName() != null) ? entity.getActor().getName() : entity.getActor().getEmail();
            dto.setActorName(name);
            dto.setActorImage(entity.getActor().getProfilePicture());
        }

        if (entity.getContent() != null) {
            dto.setContentId(entity.getContent().getId());
        }

        return dto;
    }

    @Override
    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n != null) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    @Override
    public void markAllAsRead(String email) {
        List<Notification> list = notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
    }

    @Override
    public long getUnreadCount(String email) {
        return notificationRepository.countByRecipientEmailAndIsReadFalse(email);
    }
}