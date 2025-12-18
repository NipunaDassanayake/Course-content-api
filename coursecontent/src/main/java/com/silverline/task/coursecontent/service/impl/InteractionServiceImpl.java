package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.controller.dto.response.CommentResponseDTO; // Changed to match DTO
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
import org.springframework.cache.annotation.CacheEvict; // ✅ Import for Redis
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
    private final NotificationService notificationService;

    @Override
    @Transactional
    // ✅ REDIS: Clear cache when liking so the like count updates
    @CacheEvict(value = "contentFeed", allEntries = true)
    public void toggleLike(Long contentId, String userEmail) {
        CourseContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + contentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        if (content.getLikes().contains(user)) {
            content.getLikes().remove(user); // Unlike
        } else {
            content.getLikes().add(user); // Like

            // Trigger Notification (LIKE)
            // Don't notify if liking own post
            if (!content.getUser().getId().equals(user.getId())) {
                notificationService.createNotification(
                        content.getUser(),
                        user,
                        content,
                        NotificationType.LIKE
                );
            }
        }
        contentRepository.save(content);
    }

    @Override
    // ✅ REDIS: Clear cache when commenting so comment count updates
    @CacheEvict(value = "contentFeed", allEntries = true)
    public CommentResponseDTO addComment(Long contentId, String text, String userEmail) {
        CourseContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + contentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Comment comment = new Comment();
        comment.setText(text);
        comment.setUser(user);
        comment.setCourseContent(content);

        Comment saved = commentRepository.save(comment);

        // Trigger Notification (COMMENT)
        if (!content.getUser().getId().equals(user.getId())) {
            notificationService.createNotification(
                    content.getUser(),
                    user,
                    content,
                    NotificationType.COMMENT
            );
        }

        // Map to DTO
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(saved.getId());
        dto.setText(saved.getText());
        dto.setUsername(user.getName() != null ? user.getName() : user.getEmail());
        dto.setUserAvatar(user.getProfilePicture());
        dto.setCreatedAt(saved.getCreatedAt());
        return dto;
    }

    @Override
    // Reading comments does NOT need to clear the cache
    public List<CommentResponseDTO> getComments(Long contentId) {
        return commentRepository.findByCourseContentIdOrderByCreatedAtDesc(contentId).stream().map(c -> {
            CommentResponseDTO dto = new CommentResponseDTO();
            dto.setId(c.getId());
            dto.setText(c.getText());
            dto.setUsername(c.getUser().getName() != null ? c.getUser().getName() : c.getUser().getEmail());
            dto.setUserAvatar(c.getUser().getProfilePicture());
            dto.setCreatedAt(c.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }
}