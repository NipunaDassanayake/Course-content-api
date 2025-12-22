package com.silverline.task.coursecontent.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // 👈 IMPORT THIS
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
    private User user; // ✅ This is fine, keep it so we know who uploaded it.


    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "content_likes",
            joinColumns = @JoinColumn(name = "content_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore // 👈 Added: Prevents loading thousands of users who liked this
    private Set<User> likes = new HashSet<>();


    @OneToMany(mappedBy = "courseContent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // 👈 Added: Stops the "Content -> Comment -> Content" loop
    private Set<Comment> comments = new HashSet<>();


    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // 👈 Added: Stops the "Content -> Notification -> Content" loop
    private Set<Notification> notifications = new HashSet<>();
}