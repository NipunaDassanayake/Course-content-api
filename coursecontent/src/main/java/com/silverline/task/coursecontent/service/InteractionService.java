package com.silverline.task.coursecontent.service;

import com.silverline.task.coursecontent.controller.dto.response.CommentResponseDTO;
import java.util.List;

public interface InteractionService {

    void toggleLike(Long contentId, String userEmail);

    CommentResponseDTO addComment(Long contentId, String text, String userEmail);

    List<CommentResponseDTO> getComments(Long contentId);
}