package com.home4pet.service;

import com.home4pet.dto.request.CreatePetRequest;
import com.home4pet.dto.request.UpdatePetRequest;
import com.home4pet.dto.response.PetResponse;
import com.home4pet.enums.PetSpecies;
import com.home4pet.enums.PetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface PetService {

    PetResponse createPet(CreatePetRequest request);

    PetResponse updatePet(Long id, UpdatePetRequest request);

    PetResponse getPetById(Long id);

    Page<PetResponse> searchPets(PetSpecies species, PetStatus status, String city, String search, Pageable pageable);

    Page<PetResponse> getMyPets(Pageable pageable);

    void deletePet(Long id);

    PetResponse uploadPetImage(Long petId, MultipartFile file, boolean primary);

    PetResponse deletePetImage(Long petId, Long imageId);
}
