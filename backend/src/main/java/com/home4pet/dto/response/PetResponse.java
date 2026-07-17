package com.home4pet.dto.response;

import com.home4pet.enums.Gender;
import com.home4pet.enums.PetSpecies;
import com.home4pet.enums.PetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetResponse {

    private Long id;
    private String name;
    private PetSpecies species;
    private String breed;
    private Integer age;
    private String ageUnit;
    private Gender gender;
    private String description;
    private PetStatus status;
    private BigDecimal adoptionFee;
    private String city;
    private String state;
    private Long ownerId;
    private String ownerName;
    private List<PetImageResponse> images;
    private LocalDateTime createdAt;
}
