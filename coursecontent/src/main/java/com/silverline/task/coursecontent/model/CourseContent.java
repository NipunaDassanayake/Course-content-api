package com.silverline.task.coursecontent.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "course_content")
@Data
public class CourseContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    // ✅ NEW: Description field
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "key_points", columnDefinition = "TEXT")
    private String keyPoints;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    // ✅ Likes: A set of users who liked this content
    @ManyToMany
    @JoinTable(
            name = "content_likes",
            joinColumns = @JoinColumn(name = "content_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likes = new HashSet<>();

    // ✅ Comments: List of comments
    @OneToMany(mappedBy = "courseContent", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();
}