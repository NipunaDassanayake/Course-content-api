package com.silverline.task.coursecontent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.silverline.task.coursecontent.controller.dto.response.CommentResponseDTO;
import com.silverline.task.coursecontent.security.JwtService;
import com.silverline.task.coursecontent.service.InteractionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InteractionController.class)
@AutoConfigureMockMvc(addFilters = false)
class InteractionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private InteractionService interactionService;
    @MockitoBean private JwtService jwtService; // Required for Security Config

    private final Principal mockPrincipal = () -> "test@user.com";

    @Test
    void toggleLike_Success() throws Exception {
        doNothing().when(interactionService).toggleLike(1L, "test@user.com");

        mockMvc.perform(post("/api/interactions/1/like")
                        .principal(mockPrincipal)
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void addComment_Success() throws Exception {
        Map<String, String> payload = Map.of("content", "Great post!");
        CommentResponseDTO response = new CommentResponseDTO();
        response.setText("Great post!");

        when(interactionService.addComment(eq(1L), eq("Great post!"), any()))
                .thenReturn(response);

        mockMvc.perform(post("/api/interactions/1/comment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload))
                        .principal(mockPrincipal)
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void getComments_ReturnsList() throws Exception {
        when(interactionService.getComments(1L)).thenReturn(List.of(new CommentResponseDTO()));

        mockMvc.perform(get("/api/interactions/1/comments"))
                .andExpect(status().isOk());
    }
}