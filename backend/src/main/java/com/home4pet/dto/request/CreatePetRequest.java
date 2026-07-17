package com.home4pet.dto.request;

import com.home4pet.enums.Gender;
import com.home4pet.enums.PetSpecies;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreatePetRequest {

    @NotBlank(message = "Pet name is required")
    @Size(max = 150)
    private String name;

    @NotNull(message = "Species is required")
    private PetSpecies species;

    @Size(max = 100)
    private String breed;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be at least 0")
    @Max(value = 1000, message = "Age must be at most 1000")
    private Integer age;

    @NotBlank(message = "Age unit is required")
    private String ageUnit;

    @NotNull(message = "Gender is required")
    private Gender gender;

    private String description;

    @NotNull(message = "Adoption fee is required")
    @DecimalMin(value = "0.0", message = "Adoption fee must be non-negative")
    private BigDecimal adoptionFee;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    private List<String> imageUrls;
}
