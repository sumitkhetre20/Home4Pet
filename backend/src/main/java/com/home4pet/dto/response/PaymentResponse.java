package com.home4pet.dto.response;

import com.home4pet.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long userId;
    private Long petId;
    private String petName;          // pet name for display in ledger
    private Long adoptionRequestId;
    private BigDecimal amount;
    private PaymentStatus status;
    private String transactionId;
    private String stripeSessionId;  // so frontend can call sync-payment
    private String paymentMethod;
    private String stripeCheckoutUrl;
    private LocalDateTime createdAt;
}
