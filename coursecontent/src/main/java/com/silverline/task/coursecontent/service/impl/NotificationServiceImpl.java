package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.model.*;
import com.silverline.task.coursecontent.repository.NotificationRepository;
import com.silverline.task.coursecontent.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

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
    public List<Notification> getUserNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
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