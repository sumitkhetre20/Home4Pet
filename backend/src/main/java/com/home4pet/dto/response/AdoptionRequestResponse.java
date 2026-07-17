package com.home4pet.dto.response;

import com.home4pet.enums.AdoptionRequestStatus;
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
public class AdoptionRequestResponse {

    private Long id;
    private Long petId;
    private String petName;
    private BigDecimal petAdoptionFee;
    private Long adopterId;
    private String adopterName;
    private String userEmail;      // adopter's email — used by owner view
    private Long ownerId;          // pet owner's user id — used by adopter view
    private AdoptionRequestStatus status;
    private String message;
    private String adminNote;
    private boolean hasPaidPayment;
    private LocalDateTime createdAt;
}
