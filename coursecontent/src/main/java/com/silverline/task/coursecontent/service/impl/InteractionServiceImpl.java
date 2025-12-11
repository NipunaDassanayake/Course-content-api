package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.controller.dto.response.CommentDTO;
import com.silverline.task.coursecontent.exceptions.ResourceNotFoundException;
import com.silverline.task.coursecontent.model.Comment;
import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.CommentRepository; // You need to create this simple interface
import com.silverline.task.coursecontent.repository.CourseContentRepository;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.service.InteractionService;
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

    @Override
    @Transactional
    public void toggleLike(Long contentId, String userEmail) {
        CourseContent content = contentRepository.findById(contentId).orElseThrow();
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        if (content.getLikes().contains(user)) {
            content.getLikes().remove(user); // Unlike
        } else {
            content.getLikes().add(user); // Like
        }
        contentRepository.save(content);
    }

    @Override
    public CommentDTO addComment(Long contentId, String text, String userEmail) {
        CourseContent content = contentRepository.findById(contentId).orElseThrow();
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        Comment comment = new Comment();
        comment.setText(text.replace("\"", "")); // specific cleanup if raw string sent
        comment.setUser(user);
        comment.setCourseContent(content);

        Comment saved = commentRepository.save(comment);

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