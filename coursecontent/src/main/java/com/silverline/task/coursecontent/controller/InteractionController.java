package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.controller.dto.response.CommentDTO;
import com.silverline.task.coursecontent.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InteractionController {

    private final InteractionService interactionService;

    // ✅ Toggle Like
    @PostMapping("/{contentId}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long contentId, Principal principal) {
        interactionService.toggleLike(contentId, principal.getName());
        return ResponseEntity.ok().build();
    }

    // ✅ FIX: Accept JSON Object (Map) instead of String
    @PostMapping("/{contentId}/comment")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long contentId,
            @RequestBody Map<String, String> payload, // Changed from String to Map
            Principal principal) {

        String text = payload.get("content"); // Extract text from JSON
        return ResponseEntity.ok(interactionService.addComment(contentId, text, principal.getName()));
    }

    // ✅ Get Comments
    @GetMapping("/{contentId}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long contentId) {
        return ResponseEntity.ok(interactionService.getComments(contentId));
    }
}