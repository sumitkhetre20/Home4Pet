package com.home4pet.service;

import com.home4pet.dto.response.NotificationResponse;
import com.home4pet.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    NotificationResponse createNotification(Long userId, String title, String message, NotificationType type);

    Page<NotificationResponse> getMyNotifications(Pageable pageable);

    NotificationResponse markAsRead(Long id);

    void markAllAsRead();

    long getUnreadCount();
}
