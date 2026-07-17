package com.home4pet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CheckoutSessionResponse {

    private Long paymentId;
    private String checkoutUrl;
}
