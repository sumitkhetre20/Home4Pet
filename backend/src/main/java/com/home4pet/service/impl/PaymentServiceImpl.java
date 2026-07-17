package com.home4pet.service.impl;

import com.home4pet.dto.request.CreatePaymentRequest;
import com.home4pet.dto.response.PaymentResponse;
import com.home4pet.entity.AdoptionRequest;
import com.home4pet.entity.Payment;
import com.home4pet.entity.User;
import com.home4pet.enums.AdoptionRequestStatus;
import com.home4pet.enums.NotificationType;
import com.home4pet.enums.PaymentStatus;
import com.home4pet.exception.BusinessException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.DomainMapper;
import com.home4pet.repository.AdoptionRequestRepository;
import com.home4pet.repository.PaymentRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.security.UserPrincipal;
import com.home4pet.service.NotificationService;
import com.home4pet.service.PaymentService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final UserRepository userRepository;
    private final DomainMapper domainMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AdoptionRequest adoptionRequest = adoptionRequestRepository.findById(request.getAdoptionRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("AdoptionRequest", "id", request.getAdoptionRequestId()));

        if (!adoptionRequest.getAdopter().getId().equals(userId)) {
            throw new BusinessException("You can only pay for your own adoption requests");
        }

        if (adoptionRequest.getStatus() != AdoptionRequestStatus.APPROVED) {
            throw new BusinessException("Payment is only allowed for approved adoption requests");
        }

        boolean pendingPaymentExists = paymentRepository.existsByAdoptionRequestIdAndStatusIn(
                adoptionRequest.getId(), EnumSet.of(PaymentStatus.PENDING, PaymentStatus.COMPLETED));
        if (pendingPaymentExists) {
            throw new BusinessException("A payment already exists for this adoption request");
        }

        // Amount is always fetched from the database — never accepted from the client
        Payment payment = Payment.builder()
                .user(user)
                .adoptionRequest(adoptionRequest)
                .pet(adoptionRequest.getPet())
                .amount(adoptionRequest.getPet().getAdoptionFee())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);

        notificationService.createNotification(
                userId,
                "Payment Initiated",
                "Your payment of $" + saved.getAmount() + " for " + adoptionRequest.getPet().getName() + " is pending.",
                NotificationType.PAYMENT
        );

        return domainMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(Long id) {
        Payment payment = getAccessiblePayment(id);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BusinessException("Only pending payments can be confirmed");
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());

        Payment saved = paymentRepository.save(payment);

        notificationService.createNotification(
                payment.getUser().getId(),
                "Payment Successful",
                "Your payment " + saved.getTransactionId() + " has been completed successfully.",
                NotificationType.PAYMENT
        );

        return domainMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getById(Long id) {
        return domainMapper.toResponse(getAccessiblePayment(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getMyPayments(Pageable pageable) {
        // Returns both payments made by the user AND payments received for their pets
        return paymentRepository.findByUserIdOrPetOwnerId(SecurityUtils.getCurrentUserId(), pageable)
                .map(domainMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(PaymentStatus status, Pageable pageable) {
        if (status != null) {
            return paymentRepository.findByStatus(status, pageable).map(domainMapper::toResponse);
        }
        return paymentRepository.findAll(pageable).map(domainMapper::toResponse);
    }

    private Payment getAccessiblePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));

        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !payment.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException("You are not authorized to access this payment");
        }
        return payment;
    }
}
