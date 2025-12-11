package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.controller.dto.response.CommentDTO;
import com.silverline.task.coursecontent.exceptions.ResourceNotFoundException;
import com.silverline.task.coursecontent.model.Comment;
import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.model.NotificationType;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.CommentRepository;
import com.silverline.task.coursecontent.repository.CourseContentRepository;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.service.InteractionService;
import com.silverline.task.coursecontent.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionServiceImpl implements InteractionService {

    private final CourseContentRepository contentRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService; // ✅ Inject Notification Service

    @Override
    @Transactional
    public void toggleLike(Long contentId, String userEmail) {
        CourseContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + contentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        if (content.getLikes().contains(user)) {
            content.getLikes().remove(user); // Unlike
        } else {
            content.getLikes().add(user); // Like

            // ✅ Trigger Notification (LIKE)
            notificationService.createNotification(
                    content.getUser(), // Recipient (Content Owner)
                    user,              // Actor (Liker)
                    content,           // Related Content
                    NotificationType.LIKE
            );
        }
        contentRepository.save(content);
    }

    @Override
    public CommentDTO addComment(Long contentId, String text, String userEmail) {
        CourseContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + contentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Comment comment = new Comment();
        comment.setText(text); // Text is clean from controller
        comment.setUser(user);
        comment.setCourseContent(content);

        Comment saved = commentRepository.save(comment);

        // ✅ Trigger Notification (COMMENT)
        notificationService.createNotification(
                content.getUser(), // Recipient (Content Owner)
                user,              // Actor (Commenter)
                content,           // Related Content
                NotificationType.COMMENT
        );

        // Map to DTO
        CommentDTO dto = new CommentDTO();
        dto.setId(saved.getId());
        dto.setText(saved.getText());
        dto.setUsername(user.getName() != null ? user.getName() : user.getEmail());
        dto.setUserAvatar(user.getProfilePicture());
        dto.setCreatedAt(saved.getCreatedAt());
        return dto;
    }

    @Override
    public List<CommentDTO> getComments(Long contentId) {
        return commentRepository.findByCourseContentIdOrderByCreatedAtDesc(contentId).stream().map(c -> {
            CommentDTO dto = new CommentDTO();
            dto.setId(c.getId());
            dto.setText(c.getText());
            dto.setUsername(c.getUser().getName() != null ? c.getUser().getName() : c.getUser().getEmail());
            dto.setUserAvatar(c.getUser().getProfilePicture());
            dto.setCreatedAt(c.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }
}