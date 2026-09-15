package com.internlink.core.controller;

import com.internlink.core.entity.Notification;
import com.internlink.core.entity.Role;
import com.internlink.core.entity.User;
import com.internlink.core.repository.NotificationRepository;
import com.internlink.core.repository.UserRepository;
import com.internlink.core.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JwtService jwtService;

    private String jwtToken;
    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .email("test.student@internlink.edu.vn")
                .password("$2a$10$7R.U0zX8U.Y88i8cSmgDse6WlWvhH.B18gJkU0xM0Jc9y0yHw4Y.2")
                .fullName("Sinh Vien Test")
                .role(Role.STUDENT)
                .isActive(true)
                .build());

        jwtToken = "Bearer " + jwtService.generateToken(new com.internlink.core.security.CustomUserDetails(testUser));

        testNotification = notificationRepository.save(Notification.builder()
                .userId(testUser.getId())
                .title("Thông báo học phần")
                .content("Bạn đã được duyệt vào đợt thực tập HK1")
                .type("GENERAL")
                .isRead(false)
                .build());
    }

    @Test
    @DisplayName("GET /api/v1/notifications trả về danh sách thông báo và header X-Correlation-ID")
    void getMyNotifications_ReturnsListAndCorrelationId() throws Exception {
        mockMvc.perform(get("/api/v1/notifications")
                .header(HttpHeaders.AUTHORIZATION, jwtToken)
                .header("X-Correlation-ID", "test-trace-id-12345"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Correlation-ID", "test-trace-id-12345"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Thông báo học phần")))
                .andExpect(jsonPath("$[0].isRead", is(false)));
    }

    @Test
    @DisplayName("GET /api/v1/notifications/unread-count trả về số lượng chính xác")
    void getUnreadCount_ReturnsCount() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(1)));
    }

    @Test
    @DisplayName("PATCH /api/v1/notifications/{id}/read cập nhật trạng thái đã đọc")
    void markAsRead_UpdatesIsRead() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/" + testNotification.getId() + "/read")
                .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead", is(true)));
    }

    @Test
    @DisplayName("Truy cập không có token trả về 401 Unauthorized")
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isUnauthorized());
    }
}