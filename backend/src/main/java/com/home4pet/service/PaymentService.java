package com.home4pet.service;

import com.home4pet.dto.request.CreatePaymentRequest;
import com.home4pet.dto.response.PaymentResponse;
import com.home4pet.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {

    PaymentResponse createPayment(CreatePaymentRequest request);

    PaymentResponse confirmPayment(Long id);

    PaymentResponse getById(Long id);

    Page<PaymentResponse> getMyPayments(Pageable pageable);

    Page<PaymentResponse> getAllPayments(PaymentStatus status, Pageable pageable);
}
