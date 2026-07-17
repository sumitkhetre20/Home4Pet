package com.home4pet.service.impl;

import com.home4pet.dto.request.CreatePetRequest;
import com.home4pet.dto.request.UpdatePetRequest;
import com.home4pet.dto.response.PetResponse;
import com.home4pet.entity.Pet;
import com.home4pet.entity.PetImage;
import com.home4pet.entity.User;
import com.home4pet.enums.AdoptionRequestStatus;
import com.home4pet.enums.PetStatus;
import com.home4pet.enums.PetSpecies;
import com.home4pet.enums.RoleType;
import com.home4pet.exception.BusinessException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.PetMapper;
import com.home4pet.repository.AdoptionRequestRepository;
import com.home4pet.repository.FavoriteRepository;
import com.home4pet.repository.PetRepository;
import com.home4pet.repository.ReviewRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.security.UserPrincipal;
import com.home4pet.service.FileStorageService;
import com.home4pet.service.PetService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final PetMapper petMapper;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public PetResponse createPet(CreatePetRequest request) {
        User owner = getCurrentUserEntity();
        validatePetListingRole(owner);

        Pet pet = Pet.builder()
                .name(request.getName())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .age(request.getAge())
                .ageUnit(request.getAgeUnit() != null ? request.getAgeUnit() : "YEARS")
                .gender(request.getGender())
                .description(request.getDescription())
                .adoptionFee(request.getAdoptionFee())
                .city(request.getCity())
                .state(request.getState())
                .owner(owner)
                .status(PetStatus.AVAILABLE)
                .build();

        addImages(pet, request.getImageUrls());
        return petMapper.toResponse(petRepository.save(pet));
    }

    @Override
    @Transactional
    public PetResponse updatePet(Long id, UpdatePetRequest request) {
        Pet pet = getPetEntity(id);
        validateOwnershipOrAdmin(pet);

        if (request.getName() != null) pet.setName(request.getName());
        if (request.getSpecies() != null) pet.setSpecies(request.getSpecies());
        if (request.getBreed() != null) pet.setBreed(request.getBreed());
        if (request.getAge() != null) pet.setAge(request.getAge());
        if (request.getAgeUnit() != null) pet.setAgeUnit(request.getAgeUnit());
        if (request.getGender() != null) pet.setGender(request.getGender());
        if (request.getDescription() != null) pet.setDescription(request.getDescription());
        if (request.getStatus() != null) pet.setStatus(request.getStatus());
        if (request.getAdoptionFee() != null) pet.setAdoptionFee(request.getAdoptionFee());
        if (request.getCity() != null) pet.setCity(request.getCity());
        if (request.getState() != null) pet.setState(request.getState());

        if (request.getImageUrls() != null) {
            pet.getImages().clear();
            addImages(pet, request.getImageUrls());
        }

        return petMapper.toResponse(petRepository.save(pet));
    }

    @Override
    @Transactional(readOnly = true)
    public PetResponse getPetById(Long id) {
        return petMapper.toResponse(getPetEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PetResponse> searchPets(PetSpecies species, PetStatus status, String city, String search, Pageable pageable) {
        PetStatus effectiveStatus = status != null ? status : PetStatus.AVAILABLE;
        return petRepository.searchPets(species, effectiveStatus, city, search, pageable)
                .map(petMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PetResponse> getMyPets(Pageable pageable) {
        return petRepository.findByOwnerId(SecurityUtils.getCurrentUserId(), pageable)
                .map(petMapper::toResponse);
    }

    @Override
    @Transactional
    public void deletePet(Long id) {
        Pet pet = getPetEntity(id);
        validateOwnershipOrAdmin(pet);

        boolean hasActiveAdoptions = adoptionRequestRepository.existsByPetIdAndStatusIn(
                pet.getId(), EnumSet.of(AdoptionRequestStatus.PENDING, AdoptionRequestStatus.APPROVED));
        if (hasActiveAdoptions) {
            throw new BusinessException("Cannot delete pet with active adoption requests");
        }

        pet.getImages().forEach(image -> fileStorageService.deletePetImage(image.getUrl()));
        favoriteRepository.deleteByPetId(pet.getId());
        reviewRepository.deleteByPetId(pet.getId());
        adoptionRequestRepository.deleteByPetId(pet.getId());
        petRepository.delete(pet);
    }

    @Override
    @Transactional
    public PetResponse uploadPetImage(Long petId, MultipartFile file, boolean primary) {
        Pet pet = getPetEntity(petId);
        validateOwnershipOrAdmin(pet);

        String url = fileStorageService.storePetImage(file);
        if (primary) {
            pet.getImages().forEach(img -> img.setPrimaryImage(false));
        }

        PetImage image = PetImage.builder()
                .url(url)
                .primaryImage(primary)
                .pet(pet)
                .build();
        pet.getImages().add(image);

        return petMapper.toResponse(petRepository.save(pet));
    }

    @Override
    @Transactional
    public PetResponse deletePetImage(Long petId, Long imageId) {
        Pet pet = getPetEntity(petId);
        validateOwnershipOrAdmin(pet);

        PetImage image = pet.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PetImage", "id", imageId));

        fileStorageService.deletePetImage(image.getUrl());
        pet.getImages().remove(image);

        return petMapper.toResponse(petRepository.save(pet));
    }

    private void addImages(Pet pet, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        for (int i = 0; i < imageUrls.size(); i++) {
            PetImage image = PetImage.builder()
                    .url(imageUrls.get(i))
                    .primaryImage(i == 0)
                    .pet(pet)
                    .build();
            pet.getImages().add(image);
        }
    }

    private Pet getPetEntity(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", id));
    }

    private User getCurrentUserEntity() {
        return userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", SecurityUtils.getCurrentUserId()));
    }

    private void validatePetListingRole(User user) {
        boolean canList = user.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleType.OWNER
                        || role.getName() == RoleType.SHELTER
                        || role.getName() == RoleType.NGO
                        || role.getName() == RoleType.ADMIN);
        if (!canList) {
            throw new BusinessException("Only owners, shelters, NGOs, or admins can list pets");
        }
    }

    private void validateOwnershipOrAdmin(Pet pet) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !pet.getOwner().getId().equals(currentUser.getId())) {
            throw new BusinessException("You are not authorized to modify this pet");
        }
    }
}
