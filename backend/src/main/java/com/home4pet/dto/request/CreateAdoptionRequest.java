package com.home4pet.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAdoptionRequest {

    @NotNull(message = "Pet ID is required")
    private Long petId;

    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;
}
