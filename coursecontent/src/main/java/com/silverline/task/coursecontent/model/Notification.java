package com.silverline.task.coursecontent.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    // The user receiving the notification (Content Owner)
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    // The user who performed the action (Liker/Commenter)
    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;

    // The related content
    @ManyToOne
    @JoinColumn(name = "content_id")
    private CourseContent content;
}