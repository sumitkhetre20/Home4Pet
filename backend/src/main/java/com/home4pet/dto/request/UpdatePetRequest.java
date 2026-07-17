package com.home4pet.dto.request;

import com.home4pet.enums.Gender;
import com.home4pet.enums.PetSpecies;
import com.home4pet.enums.PetStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePetRequest {

    @Size(max = 150)
    private String name;

    private PetSpecies species;

    @Size(max = 100)
    private String breed;

    @Min(0)
    @Max(1000)
    private Integer age;

    private String ageUnit;

    private Gender gender;

    private String description;

    private PetStatus status;

    @DecimalMin("0.0")
    private BigDecimal adoptionFee;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    private List<String> imageUrls;
}
