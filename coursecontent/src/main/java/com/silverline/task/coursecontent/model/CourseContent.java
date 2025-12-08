package com.silverline.task.coursecontent.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
// CourseContent.java
@Entity
@Table(name = "course_content")
@Data
public class CourseContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

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
    private String keyPoints; // we'll save as simple text with bullets or JSON




}
