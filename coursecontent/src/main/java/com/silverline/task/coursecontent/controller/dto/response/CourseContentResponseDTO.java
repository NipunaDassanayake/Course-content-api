package com.silverline.task.coursecontent.controller.dto.response;

import lombok.Data;
import java.io.Serializable; // ✅ Import
import java.time.LocalDateTime;

@Data
// ✅ Implements Serializable is REQUIRED for Redis
public class CourseContentResponseDTO implements Serializable {

    private static final long serialVersionUID = 1L; // ✅ Version Control

    private Long id;
    private String fileName;
    private String description;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadDate;
    private String fileUrl;
    private String uploadedBy;
    private String uploaderImage;
    private int likeCount;
    private int commentCount;
    private boolean likedByCurrentUser;
}