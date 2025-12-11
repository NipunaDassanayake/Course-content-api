package com.silverline.task.coursecontent.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "course_contents")
@Getter
@Setter
public class CourseContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ... (other fields: fileName, description, etc.) ...
    private String fileName;
    private String description;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadDate;
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String keyPoints;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ✅ FIX 1: Cascade delete for Likes
    // When content is deleted, remove the relationship from the join table
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "content_likes",
            joinColumns = @JoinColumn(name = "content_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likes = new HashSet<>();

    // ✅ FIX 2: Cascade delete for Comments
    // If content is deleted, delete all comments associated with it
    @OneToMany(mappedBy = "courseContent", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    // ✅ FIX 3: Cascade delete for Notifications
    // If content is deleted, delete all notifications about it
    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Notification> notifications = new HashSet<>();
}