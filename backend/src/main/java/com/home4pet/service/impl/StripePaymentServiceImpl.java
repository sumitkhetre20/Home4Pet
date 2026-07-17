package com.home4pet.service.impl;

import com.home4pet.config.StripeProperties;
import com.home4pet.dto.request.CheckoutSessionRequest;
import com.home4pet.dto.response.CheckoutSessionResponse;
import com.home4pet.entity.AdoptionRequest;
import com.home4pet.entity.Payment;
import com.home4pet.entity.Pet;
import com.home4pet.entity.User;
import com.home4pet.enums.AdoptionRequestStatus;
import com.home4pet.enums.NotificationType;
import com.home4pet.enums.PaymentStatus;
import com.home4pet.enums.PetStatus;
import com.home4pet.exception.BusinessException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.repository.AdoptionRequestRepository;
import com.home4pet.repository.PaymentRepository;
import com.home4pet.repository.PetRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.service.NotificationService;
import com.home4pet.service.StripePaymentService;
import com.home4pet.util.SecurityUtils;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.EnumSet;
import java.util.List;

import static com.stripe.model.Event.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentServiceImpl implements StripePaymentService {

    private static final String PAYMENT_METHOD = "stripe";
    private static final String CURRENCY = "inr";

    private final StripeProperties stripeProperties;
    private final PaymentRepository paymentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final NotificationService notificationService;

    // -------------------------------------------------------------------------
    // Create Checkout Session
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public CheckoutSessionResponse createCheckoutSession(CheckoutSessionRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", request.getPetId()));

        if (pet.getStatus() == PetStatus.ADOPTED) {
            throw new BusinessException("This pet has already been adopted");
        }

        if (pet.getAdoptionFee() == null || pet.getAdoptionFee().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BusinessException("This pet does not have a valid adoption fee");
        }

        // Guard: no duplicate PENDING or COMPLETED payment for same pet+user
        boolean alreadyExists = paymentRepository.existsByPetIdAndUserIdAndStatusIn(
                pet.getId(), userId, EnumSet.of(PaymentStatus.PENDING, PaymentStatus.COMPLETED));
        if (alreadyExists) {
            throw new BusinessException("A payment already exists for this pet. Check your payment history.");
        }

        long amountInCents = pet.getAdoptionFee()
                .multiply(new java.math.BigDecimal("100"))
                .longValue();

        Session session;
        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(stripeProperties.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(stripeProperties.getCancelUrl())
                    .setCustomerEmail(user.getEmail())
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency(CURRENCY)
                                                    .setUnitAmount(amountInCents)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Adoption Fee — " + pet.getName())
                                                                    .setDescription("Adoption fee for "
                                                                            + pet.getSpecies().name().toLowerCase()
                                                                            + " " + pet.getName())
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .putMetadata("petId", String.valueOf(pet.getId()))
                    .putMetadata("userId", String.valueOf(userId))
                    .build();

            session = Session.create(params);
        } catch (StripeException e) {
            log.error("Stripe session creation failed petId={} userId={}: {}", pet.getId(), userId, e.getMessage());
            throw new BusinessException("Payment session could not be created. Please try again.",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }

        Payment payment = Payment.builder()
                .user(user)
                .pet(pet)
                .amount(pet.getAdoptionFee())
                .status(PaymentStatus.PENDING)
                .stripeSessionId(session.getId())
                .paymentMethod(PAYMENT_METHOD)
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Checkout session created: sessionId={} paymentId={} petId={} userId={}",
                session.getId(), saved.getId(), pet.getId(), userId);

        return new CheckoutSessionResponse(saved.getId(), session.getUrl());
    }

    // -------------------------------------------------------------------------
    // Webhook handler (production path — Stripe calls this server-to-server)
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public void handleWebhookEvent(String payload, String sigHeader) {
        // If webhook secret is not configured (local dev), skip signature verification
        // and parse the event directly. In production the secret must always be set.
        Event event;
        String webhookSecret = stripeProperties.getWebhookSecret();

        if (StringUtils.hasText(webhookSecret)) {
            try {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            } catch (SignatureVerificationException e) {
                log.warn("Invalid Stripe webhook signature: {}", e.getMessage());
                throw new BusinessException("Invalid webhook signature", HttpStatus.BAD_REQUEST);
            }
        } else {
            // No secret configured — parse without verification (local dev only)
            log.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev mode)");
            try {
                event = GSON.fromJson(payload, Event.class);
            } catch (Exception e) {
                log.error("Failed to parse Stripe webhook payload: {}", e.getMessage());
                throw new BusinessException("Could not parse webhook payload", HttpStatus.BAD_REQUEST);
            }
        }

        log.info("Stripe webhook received: type={} id={}", event.getType(), event.getId());

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new BusinessException("Could not deserialize Stripe event data"));

            if ("paid".equals(session.getPaymentStatus())) {
                completePaymentFlow(session.getId(), session.getPaymentIntent());
            }
        }
    }

    // -------------------------------------------------------------------------
    // Sync payment (local dev / success-URL fallback path)
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public boolean syncPaymentBySessionId(String sessionId) {
        // Fast-path: already completed — idempotent
        Payment payment = paymentRepository.findByStripeSessionId(sessionId).orElse(null);
        if (payment == null) {
            log.warn("syncPayment: no payment record found for sessionId={}", sessionId);
            return false;
        }
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("syncPayment: already completed for sessionId={}", sessionId);
            return true;
        }

        // Fetch live session status directly from Stripe API
        Session session;
        try {
            session = Session.retrieve(sessionId);
        } catch (StripeException e) {
            log.error("syncPayment: Stripe retrieve failed sessionId={}: {}", sessionId, e.getMessage());
            throw new BusinessException("Could not verify payment status with Stripe.",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }

        if ("paid".equals(session.getPaymentStatus())) {
            completePaymentFlow(session.getId(), session.getPaymentIntent());
            return true;
        }

        log.info("syncPayment: Stripe session not paid yet, paymentStatus={} sessionId={}",
                session.getPaymentStatus(), sessionId);
        return false;
    }

    // -------------------------------------------------------------------------
    // Core completion logic — called by both webhook and sync paths
    // Must be called from within an active @Transactional context.
    // -------------------------------------------------------------------------

    private void completePaymentFlow(String stripeSessionId, String paymentIntentId) {
        Payment payment = paymentRepository.findByStripeSessionId(stripeSessionId).orElse(null);

        if (payment == null) {
            log.warn("completePaymentFlow: no payment found for stripeSessionId={}", stripeSessionId);
            return;
        }

        // Idempotency guard — safe to call multiple times
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("completePaymentFlow: already completed, skipping. sessionId={}", stripeSessionId);
            return;
        }

        // 1. Mark payment COMPLETED and store Stripe's payment intent ID as transaction ID
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId(paymentIntentId);
        paymentRepository.save(payment);
        log.info("Payment {} marked COMPLETED, transactionId={}", payment.getId(), paymentIntentId);

        Pet pet = payment.getPet();
        User adopter = payment.getUser();

        // 2. Find the adopter's APPROVED adoption request for this pet and mark it COMPLETED
        adoptionRequestRepository
                .findFirstByPetIdAndAdopterIdAndStatus(
                        pet.getId(), adopter.getId(), AdoptionRequestStatus.APPROVED)
                .ifPresent(ar -> {
                    ar.setStatus(AdoptionRequestStatus.COMPLETED);
                    adoptionRequestRepository.save(ar);
                    log.info("AdoptionRequest {} marked COMPLETED", ar.getId());
                });

        // 3. Mark pet as ADOPTED
        pet.setStatus(PetStatus.ADOPTED);
        petRepository.save(pet);
        log.info("Pet {} marked ADOPTED", pet.getId());

        // 4. Cancel all remaining PENDING/APPROVED requests for this pet from other adopters
        List<AdoptionRequest> otherRequests = adoptionRequestRepository
                .findByPetIdAndStatusIn(pet.getId(),
                        EnumSet.of(AdoptionRequestStatus.PENDING, AdoptionRequestStatus.APPROVED));

        for (AdoptionRequest ar : otherRequests) {
            ar.setStatus(AdoptionRequestStatus.CANCELLED);
            adoptionRequestRepository.save(ar);
            notificationService.createNotification(
                    ar.getAdopter().getId(),
                    "Adoption Request Cancelled",
                    "Unfortunately, " + pet.getName() + " has been adopted by someone else.",
                    NotificationType.ADOPTION
            );
        }

        // 5. Notify adopter
        notificationService.createNotification(
                adopter.getId(),
                "Payment Successful — Adoption Complete!",
                "Your adoption of " + pet.getName() + " is complete. Transaction ID: " + paymentIntentId,
                NotificationType.PAYMENT
        );

        // 6. Notify pet owner
        notificationService.createNotification(
                pet.getOwner().getId(),
                "Adoption Fee Received",
                adopter.getFirstName() + " " + adopter.getLastName()
                        + " has completed the adoption payment for " + pet.getName() + ".",
                NotificationType.PAYMENT
        );

        log.info("Payment flow complete: paymentId={} petId={} adopterId={}",
                payment.getId(), pet.getId(), adopter.getId());
    }
}
