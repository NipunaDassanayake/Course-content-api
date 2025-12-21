package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.security.JwtService;
import com.silverline.task.coursecontent.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private NotificationService notificationService;
    @MockitoBean private JwtService jwtService;

    private final Principal mockPrincipal = () -> "test@user.com";

    @Test
    void getNotifications_Success() throws Exception {
        when(notificationService.getUserNotifications("test@user.com")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/notifications")
                        .principal(mockPrincipal))
                .andExpect(status().isOk());
    }

    @Test
    void getUnreadCount_Success() throws Exception {
        when(notificationService.getUnreadCount("test@user.com")).thenReturn(5L);

        mockMvc.perform(get("/api/notifications/count")
                        .principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @Test
    void markRead_Success() throws Exception {
        mockMvc.perform(put("/api/notifications/1/read")
                        .with(csrf()))
                .andExpect(status().isOk());
    }
}