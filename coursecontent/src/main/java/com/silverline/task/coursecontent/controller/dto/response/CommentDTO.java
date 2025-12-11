package com.silverline.task.coursecontent.controller.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private Long id;
    private String text;
    private String username;
    private String userAvatar;
    private LocalDateTime createdAt;
}