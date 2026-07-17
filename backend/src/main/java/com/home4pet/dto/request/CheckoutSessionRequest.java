package com.home4pet.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CheckoutSessionRequest {

    @NotNull(message = "Pet ID is required")
    private Long petId;
}
