package com.home4pet.service.impl;

import com.home4pet.dto.response.NotificationResponse;
import com.home4pet.entity.Notification;
import com.home4pet.entity.User;
import com.home4pet.enums.NotificationType;
import com.home4pet.exception.BusinessException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.DomainMapper;
import com.home4pet.repository.NotificationRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.service.NotificationService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final DomainMapper domainMapper;

    @Override
    @Transactional
    public NotificationResponse createNotification(Long userId, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .build();

        return domainMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(SecurityUtils.getCurrentUserId(), pageable)
                .map(domainMapper::toResponse);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = getOwnedNotification(id);
        notification.setRead(true);
        return domainMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsReadByUserId(SecurityUtils.getCurrentUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByUserIdAndReadFalse(SecurityUtils.getCurrentUserId());
    }

    private Notification getOwnedNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        if (!notification.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("You are not authorized to access this notification");
        }
        return notification;
    }
}
