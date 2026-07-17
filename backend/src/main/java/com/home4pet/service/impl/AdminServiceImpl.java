package com.home4pet.service.impl;

import com.home4pet.dto.response.DashboardStatsResponse;
import com.home4pet.enums.AdoptionRequestStatus;
import com.home4pet.enums.PaymentStatus;
import com.home4pet.enums.PetStatus;
import com.home4pet.repository.AdoptionRequestRepository;
import com.home4pet.repository.NotificationRepository;
import com.home4pet.repository.PaymentRepository;
import com.home4pet.repository.PetRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        return DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalPets(petRepository.count())
                .availablePets(petRepository.countByStatus(PetStatus.AVAILABLE))
                .pendingAdoptions(adoptionRequestRepository.countByStatus(AdoptionRequestStatus.PENDING))
                .completedPayments(paymentRepository.countByStatus(PaymentStatus.COMPLETED))
                .unreadNotifications(notificationRepository.countByReadFalse())
                .build();
    }
}
