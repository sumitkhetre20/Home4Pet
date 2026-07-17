package com.home4pet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponse {

    private Long id;
    private Long petId;
    private PetResponse pet;
    private LocalDateTime createdAt;
}
