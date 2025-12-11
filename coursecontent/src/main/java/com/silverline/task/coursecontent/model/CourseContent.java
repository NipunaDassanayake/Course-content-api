package com.silverline.task.coursecontent.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "course_contents")
@Getter // ✅ Use Getter instead of Data
@Setter // ✅ Use Setter instead of Data
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
    private User user;

    // ✅ Relationships
    @ManyToMany
    @JoinTable(
            name = "content_likes",
            joinColumns = @JoinColumn(name = "content_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likes = new HashSet<>();

    @OneToMany(mappedBy = "courseContent", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();
}