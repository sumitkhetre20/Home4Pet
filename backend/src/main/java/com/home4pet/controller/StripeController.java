package com.home4pet.controller;

import com.home4pet.common.response.ApiResponse;
import com.home4pet.dto.request.CheckoutSessionRequest;
import com.home4pet.dto.response.CheckoutSessionResponse;
import com.home4pet.service.StripePaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/stripe")
@RequiredArgsConstructor
public class StripeController {

    private final StripePaymentService stripePaymentService;

    /**
     * Creates a Stripe Checkout Session.
     * Frontend sends only petId — amount is fetched from DB, never trusted from client.
     * Requires JWT authentication.
     */
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<CheckoutSessionResponse>> createCheckoutSession(
            @Valid @RequestBody CheckoutSessionRequest request) {
        CheckoutSessionResponse response = stripePaymentService.createCheckoutSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Checkout session created", response));
    }

    /**
     * Called by the frontend after Stripe redirects back with ?session_id=...
     * Fetches session status from Stripe directly and completes the payment if paid.
     * Requires JWT — the user must be logged in (their session is preserved in localStorage).
     */
    @PostMapping("/sync-payment")
    public ResponseEntity<ApiResponse<Boolean>> syncPayment(
            @RequestParam String sessionId) {
        boolean completed = stripePaymentService.syncPaymentBySessionId(sessionId);
        String message = completed ? "Payment verified and completed" : "Payment not yet confirmed by Stripe";
        return ResponseEntity.ok(ApiResponse.success(message, completed));
    }

    /**
     * Stripe webhook endpoint — must be PUBLIC (no JWT).
     * Stripe signature in the header is verified server-side before processing.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        stripePaymentService.handleWebhookEvent(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
