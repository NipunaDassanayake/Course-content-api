package com.silverline.task.coursecontent.service;

import com.silverline.task.coursecontent.controller.dto.response.NotificationResponseDTO; // ✅ Import DTO
import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.model.NotificationType;
import com.silverline.task.coursecontent.model.User;
import java.util.List;

public interface NotificationService {
    void createNotification(User recipient, User actor, CourseContent content, NotificationType type);

    // ✅ Change return type here
    List<NotificationResponseDTO> getUserNotifications(String email);

    void markAsRead(Long id);
    void markAllAsRead(String email);
    long getUnreadCount(String email);
}