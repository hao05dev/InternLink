package com.internlink.core.service;

import com.internlink.core.dto.notification.CreateNotificationRequest;
import com.internlink.core.dto.notification.NotificationResponse;
import com.internlink.core.entity.Notification;
import com.internlink.core.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleNotification = Notification.builder()
                .id(1L)
                .userId(100L)
                .title("Offer mới")
                .content("Bạn nhận được offer thực tập từ FPT Software")
                .type("OFFER")
                .isRead(false)
                .actionUrl("/student/applications/1")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Lấy danh sách thông báo của User thành công")
    void getUserNotifications_Success() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(100L))
                .thenReturn(List.of(sampleNotification));

        List<NotificationResponse> result = notificationService.getUserNotifications(100L);

        assertEquals(1, result.size());
        assertEquals("Offer mới", result.get(0).getTitle());
        assertFalse(result.get(0).getIsRead());
    }

    @Test
    @DisplayName("Lấy số lượng thông báo chưa đọc")
    void getUnreadCount_Success() {
        when(notificationRepository.countByUserIdAndIsReadFalse(100L)).thenReturn(5L);

        long unread = notificationService.getUnreadCount(100L);
        assertEquals(5L, unread);
    }

    @Test
    @DisplayName("Đánh dấu thông báo đã đọc thành công")
    void markAsRead_Success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(1L, 100L);

        assertTrue(response.getIsRead());
        verify(notificationRepository, times(1)).save(sampleNotification);
    }

    @Test
    @DisplayName("Đánh dấu thông báo của người khác báo lỗi AccessDeniedException")
    void markAsRead_AccessDenied_ThrowsException() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));

        assertThrows(AccessDeniedException.class, () -> notificationService.markAsRead(1L, 999L));
    }

    @Test
    @DisplayName("Gửi thông báo mới thành công")
    void sendNotification_Success() {
        CreateNotificationRequest req = CreateNotificationRequest.builder()
                .userId(100L)
                .title("Phỏng vấn mới")
                .content("Lịch phỏng vấn lúc 9h sáng mai")
                .type("INTERVIEW")
                .build();

        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> {
            Notification n = i.getArgument(0);
            n.setId(2L);
            n.setCreatedAt(LocalDateTime.now());
            return n;
        });

        NotificationResponse response = notificationService.sendNotification(req);

        assertNotNull(response.getId());
        assertEquals("Phỏng vấn mới", response.getTitle());
        assertFalse(response.getIsRead());
    }
}