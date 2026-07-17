package com.home4pet.mapper;

import com.home4pet.dto.response.AdoptionRequestResponse;
import com.home4pet.dto.response.ChatMessageResponse;
import com.home4pet.dto.response.FavoriteResponse;
import com.home4pet.dto.response.NotificationResponse;
import com.home4pet.dto.response.PaymentResponse;
import com.home4pet.dto.response.ReviewResponse;
import com.home4pet.entity.AdoptionRequest;
import com.home4pet.entity.ChatMessage;
import com.home4pet.entity.Favorite;
import com.home4pet.entity.Notification;
import com.home4pet.entity.Payment;
import com.home4pet.entity.Review;
import com.home4pet.enums.PaymentStatus;
import com.home4pet.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.EnumSet;

@Component
@RequiredArgsConstructor
public class DomainMapper {

    private final PetMapper petMapper;
    private final PaymentRepository paymentRepository;

    public AdoptionRequestResponse toResponse(AdoptionRequest request) {
        boolean paid = paymentRepository.existsByPetIdAndUserIdAndStatusIn(
                request.getPet().getId(),
                request.getAdopter().getId(),
                EnumSet.of(PaymentStatus.COMPLETED)
        );
        return AdoptionRequestResponse.builder()
                .id(request.getId())
                .petId(request.getPet().getId())
                .petName(request.getPet().getName())
                .petAdoptionFee(request.getPet().getAdoptionFee())
                .adopterId(request.getAdopter().getId())
                .adopterName(request.getAdopter().getFirstName() + " " + request.getAdopter().getLastName())
                .userEmail(request.getAdopter().getEmail())
                .ownerId(request.getPet().getOwner().getId())
                .status(request.getStatus())
                .message(request.getMessage())
                .adminNote(request.getAdminNote())
                .hasPaidPayment(paid)
                .createdAt(request.getCreatedAt())
                .build();
    }

    public FavoriteResponse toResponse(Favorite favorite) {
        return FavoriteResponse.builder()
                .id(favorite.getId())
                .petId(favorite.getPet().getId())
                .pet(petMapper.toResponse(favorite.getPet()))
                .createdAt(favorite.getCreatedAt())
                .build();
    }

    public ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .petId(review.getPet().getId())
                .petName(review.getPet().getName())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFirstName() + " " + review.getUser().getLastName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUser().getId())
                .petId(payment.getPet() != null ? payment.getPet().getId() : null)
                .petName(payment.getPet() != null ? payment.getPet().getName() : null)
                .adoptionRequestId(payment.getAdoptionRequest() != null ? payment.getAdoptionRequest().getId() : null)
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .stripeSessionId(payment.getStripeSessionId())
                .paymentMethod(payment.getPaymentMethod())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public ChatMessageResponse toResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
