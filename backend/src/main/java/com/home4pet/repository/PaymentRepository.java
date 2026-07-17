package com.home4pet.repository;

import com.home4pet.entity.Payment;
import com.home4pet.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Page<Payment> findByUserId(Long userId, Pageable pageable);

    // Payments visible to a pet owner: their own payments + payments made for their pets
    @Query("SELECT p FROM Payment p WHERE p.user.id = :userId OR p.pet.owner.id = :userId")
    Page<Payment> findByUserIdOrPetOwnerId(@Param("userId") Long userId, Pageable pageable);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    long countByStatus(PaymentStatus status);

    boolean existsByAdoptionRequestIdAndStatusIn(Long adoptionRequestId, Collection<PaymentStatus> statuses);

    Optional<Payment> findByStripeSessionId(String stripeSessionId);

    boolean existsByPetIdAndUserIdAndStatusIn(Long petId, Long userId, Collection<PaymentStatus> statuses);
}
