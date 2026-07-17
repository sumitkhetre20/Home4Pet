package com.home4pet.service;

import com.home4pet.dto.request.CheckoutSessionRequest;
import com.home4pet.dto.response.CheckoutSessionResponse;

public interface StripePaymentService {

    CheckoutSessionResponse createCheckoutSession(CheckoutSessionRequest request);

    void handleWebhookEvent(String payload, String sigHeader);

    /**
     * Called by the frontend after Stripe redirects back with ?session_id=...
     * Fetches the session status directly from Stripe API and completes the payment
     * if paid. This is the fallback for local dev where webhooks can't reach localhost.
     */
    boolean syncPaymentBySessionId(String sessionId);
}
