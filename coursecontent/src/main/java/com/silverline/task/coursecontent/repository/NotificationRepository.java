package com.silverline.task.coursecontent.repository;

import com.silverline.task.coursecontent.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Get all notifications for a user, newest first
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);

    // Count unread notifications
    long countByRecipientEmailAndIsReadFalse(String email);
}