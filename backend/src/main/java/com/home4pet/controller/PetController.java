package com.home4pet.controller;

import com.home4pet.common.pagination.PageResponse;
import com.home4pet.common.response.ApiResponse;
import com.home4pet.constants.AppConstants;
import com.home4pet.dto.request.CreatePetRequest;
import com.home4pet.dto.request.UpdatePetRequest;
import com.home4pet.dto.response.PetResponse;
import com.home4pet.enums.PetSpecies;
import com.home4pet.enums.PetStatus;
import com.home4pet.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PetResponse>>> searchPets(
            @RequestParam(required = false) PetSpecies species,
            @RequestParam(required = false) PetStatus status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIRECTION) String sortDir
    ) {
        Pageable pageable = PageRequest.of(page, size, buildSort(sortBy, sortDir));
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(petService.searchPets(species, status, city, search, pageable))
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PetResponse>> getPetById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(petService.getPetById(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<PetResponse>>> getMyPets(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(petService.getMyPets(pageable))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PetResponse>> createPet(@Valid @RequestBody CreatePetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pet created successfully", petService.createPet(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PetResponse>> updatePet(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePetRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Pet updated successfully", petService.updatePet(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return ResponseEntity.ok(ApiResponse.success("Pet deleted successfully"));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<PetResponse>> uploadPetImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean primary
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Image uploaded successfully",
                petService.uploadPetImage(id, file, primary)
        ));
    }

    @DeleteMapping("/{petId}/images/{imageId}")
    public ResponseEntity<ApiResponse<PetResponse>> deletePetImage(
            @PathVariable Long petId,
            @PathVariable Long imageId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Image deleted successfully",
                petService.deletePetImage(petId, imageId)
        ));
    }

    private Sort buildSort(String sortBy, String sortDir) {
        return sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
    }
}
