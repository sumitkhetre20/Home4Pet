package com.home4pet.mapper;

import com.home4pet.dto.response.PetImageResponse;
import com.home4pet.dto.response.PetResponse;
import com.home4pet.entity.Pet;
import com.home4pet.entity.PetImage;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class PetMapper {

    public PetResponse toResponse(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .ageUnit(pet.getAgeUnit())
                .gender(pet.getGender())
                .description(pet.getDescription())
                .status(pet.getStatus())
                .adoptionFee(pet.getAdoptionFee())
                .city(pet.getCity())
                .state(pet.getState())
                .ownerId(pet.getOwner().getId())
                .ownerName(pet.getOwner().getFirstName() + " " + pet.getOwner().getLastName())
                .images(toImageResponses(pet.getImages()))
                .createdAt(pet.getCreatedAt())
                .build();
    }

    public PetImageResponse toImageResponse(PetImage image) {
        return PetImageResponse.builder()
                .id(image.getId())
                .url(image.getUrl())
                .primaryImage(image.isPrimaryImage())
                .build();
    }

    public List<PetImageResponse> toImageResponses(List<PetImage> images) {
        if (images == null) {
            return Collections.emptyList();
        }
        return images.stream().map(this::toImageResponse).toList();
    }
}
