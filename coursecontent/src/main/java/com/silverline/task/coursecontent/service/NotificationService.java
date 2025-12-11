package com.silverline.task.coursecontent.service;

import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.model.NotificationType;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.model.Notification;
import java.util.List;

public interface NotificationService {
    void createNotification(User recipient, User actor, CourseContent content, NotificationType type);
    List<Notification> getUserNotifications(String email);
    void markAsRead(Long id);
    void markAllAsRead(String email);
    long getUnreadCount(String email);
}