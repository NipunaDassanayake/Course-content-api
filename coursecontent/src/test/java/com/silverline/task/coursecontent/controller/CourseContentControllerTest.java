package com.silverline.task.coursecontent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.service.CourseContentService;
import com.silverline.task.coursecontent.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// New MockitoBean import
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CourseContentController.class)
@AutoConfigureMockMvc(addFilters = false) // Security filters are OFF
class CourseContentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseContentService courseContentService;

    @MockitoBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    // Helper to create a fake user
    private Principal mockPrincipal = () -> "test@example.com";

    @Test
    void getAllContent_ReturnsPage() throws Exception {
        Page<CourseContentResponseDTO> page = new PageImpl<>(Collections.emptyList());
        when(courseContentService.getAllContent(anyInt(), anyInt(), any())).thenReturn(page);

        mockMvc.perform(get("/api/content")
                        .principal(mockPrincipal)) // ✅ Inject Fake User
                .andExpect(status().isOk());
    }

    @Test
    void uploadContent_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "data".getBytes());

        UploadResponseDTO response = new UploadResponseDTO();
        response.setId(1L);
        response.setFileName("test.pdf");
        response.setDownloadUrl("http://localhost:8080/test.pdf");
        response.setFileType("application/pdf");
        response.setFileSize(100L);

        when(courseContentService.uploadFile(any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(multipart("/api/content")
                        .file(file)
                        .param("description", "Test file")
                        .principal(mockPrincipal)) // ✅ Inject Fake User
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("test.pdf"));
    }

    @Test
    void deleteContent_Success() throws Exception {
        doNothing().when(courseContentService).deleteContent(anyLong(), anyString());

        mockMvc.perform(delete("/api/content/1")
                        .principal(mockPrincipal)) // ✅ Inject Fake User
                .andExpect(status().isOk())
                .andExpect(content().string("Content deleted successfully"));
    }

    @Test
    void getMyContents_ReturnsList() throws Exception {
        when(courseContentService.getMyContents(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/content/my-contents")
                        .principal(mockPrincipal)) // ✅ Inject Fake User
                .andExpect(status().isOk());
    }
}