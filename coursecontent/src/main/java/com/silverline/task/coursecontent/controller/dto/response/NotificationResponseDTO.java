package com.silverline.task.coursecontent.controller.dto.response;

import com.silverline.task.coursecontent.model.NotificationType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDTO {
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private NotificationType type;

    // Actor details (The person who liked/commented)
    private String actorName;
    private String actorImage;

    // Content details (for linking)
    private Long contentId;
}