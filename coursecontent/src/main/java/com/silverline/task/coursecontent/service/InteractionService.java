package com.silverline.task.coursecontent.service;

import com.silverline.task.coursecontent.controller.dto.response.CommentDTO;
import java.util.List;

public interface InteractionService {

    void toggleLike(Long contentId, String userEmail);

    CommentDTO addComment(Long contentId, String text, String userEmail);

    List<CommentDTO> getComments(Long contentId);
}