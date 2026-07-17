package com.home4pet.dto.request;

import com.home4pet.enums.AdoptionRequestStatus;
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
public class UpdateAdoptionRequestStatus {

    @NotNull(message = "Status is required")
    private AdoptionRequestStatus status;

    @Size(max = 1000, message = "Admin note must not exceed 1000 characters")
    private String adminNote;
}
