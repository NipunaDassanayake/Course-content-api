package com.silverline.task.coursecontent.controller.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CourseContentResponseDTO {

    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadDate;
    private String fileUrl;


}