package com.home4pet.service.impl;

import com.home4pet.dto.request.CreateAdoptionRequest;
import com.home4pet.dto.request.UpdateAdoptionRequestStatus;
import com.home4pet.dto.response.AdoptionRequestResponse;
import com.home4pet.entity.AdoptionRequest;
import com.home4pet.entity.Pet;
import com.home4pet.entity.User;
import com.home4pet.enums.AdoptionRequestStatus;
import com.home4pet.enums.NotificationType;
import com.home4pet.enums.PetStatus;
import com.home4pet.exception.BusinessException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.DomainMapper;
import com.home4pet.repository.AdoptionRequestRepository;
import com.home4pet.repository.PetRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.security.UserPrincipal;
import com.home4pet.service.AdoptionRequestService;
import com.home4pet.service.NotificationService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;

@Service
@RequiredArgsConstructor
public class AdoptionRequestServiceImpl implements AdoptionRequestService {

    private final AdoptionRequestRepository adoptionRequestRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final DomainMapper domainMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public AdoptionRequestResponse createRequest(CreateAdoptionRequest request) {
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", request.getPetId()));

        if (pet.getStatus() != PetStatus.AVAILABLE) {
            throw new BusinessException("Pet is not available for adoption");
        }

        Long adopterId = SecurityUtils.getCurrentUserId();
        if (pet.getOwner().getId().equals(adopterId)) {
            throw new BusinessException("You cannot adopt your own pet");
        }

        boolean exists = adoptionRequestRepository.existsByPetIdAndAdopterIdAndStatusIn(
                pet.getId(), adopterId, EnumSet.of(AdoptionRequestStatus.PENDING, AdoptionRequestStatus.APPROVED));
        if (exists) {
            throw new BusinessException("You already have an active adoption request for this pet");
        }

        User adopter = userRepository.findById(adopterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adopterId));

        AdoptionRequest adoptionRequest = AdoptionRequest.builder()
                .pet(pet)
                .adopter(adopter)
                .message(request.getMessage())
                .status(AdoptionRequestStatus.PENDING)
                .build();

        adoptionRequest = adoptionRequestRepository.save(adoptionRequest);
        pet.setStatus(PetStatus.PENDING);
        petRepository.save(pet);

        notificationService.createNotification(
                pet.getOwner().getId(),
                "New Adoption Request",
                adopter.getFirstName() + " requested to adopt " + pet.getName(),
                NotificationType.ADOPTION
        );

        return domainMapper.toResponse(adoptionRequest);
    }

    @Override
    @Transactional
    public AdoptionRequestResponse updateStatus(Long id, UpdateAdoptionRequestStatus request) {
        AdoptionRequest adoptionRequest = getEntity(id);
        validateStatusUpdateAccess(adoptionRequest);

        AdoptionRequestStatus newStatus = request.getStatus();

        adoptionRequest.setStatus(newStatus);
        if (request.getAdminNote() != null) {
            adoptionRequest.setAdminNote(request.getAdminNote());
        }

        Pet pet = adoptionRequest.getPet();
        switch (newStatus) {
            case APPROVED -> pet.setStatus(PetStatus.PENDING);
            case COMPLETED -> pet.setStatus(PetStatus.ADOPTED);
            case REJECTED, CANCELLED -> {
                if (pet.getStatus() == PetStatus.PENDING) {
                    pet.setStatus(PetStatus.AVAILABLE);
                }
            }
            default -> { }
        }
        petRepository.save(pet);

        adoptionRequest = adoptionRequestRepository.save(adoptionRequest);

        notificationService.createNotification(
                adoptionRequest.getAdopter().getId(),
                "Adoption Request Updated",
                "Your adoption request for " + pet.getName() + " is now " + newStatus.name(),
                NotificationType.ADOPTION
        );

        return domainMapper.toResponse(adoptionRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public AdoptionRequestResponse getById(Long id) {
        AdoptionRequest request = getEntity(id);
        validateReadAccess(request);
        return domainMapper.toResponse(request);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdoptionRequestResponse> getMyRequests(Pageable pageable) {
        return adoptionRequestRepository.findByAdopterId(SecurityUtils.getCurrentUserId(), pageable)
                .map(domainMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdoptionRequestResponse> getReceivedRequests(Pageable pageable) {
        return adoptionRequestRepository.findByPet_OwnerId(SecurityUtils.getCurrentUserId(), pageable)
                .map(domainMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdoptionRequestResponse> getAllRequests(AdoptionRequestStatus status, Pageable pageable) {
        if (status != null) {
            return adoptionRequestRepository.findByStatus(status, pageable).map(domainMapper::toResponse);
        }
        return adoptionRequestRepository.findAll(pageable).map(domainMapper::toResponse);
    }

    private AdoptionRequest getEntity(Long id) {
        return adoptionRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AdoptionRequest", "id", id));
    }

    private void validateStatusUpdateAccess(AdoptionRequest request) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = request.getPet().getOwner().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new BusinessException("You are not authorized to update this adoption request");
        }
    }

    private void validateReadAccess(AdoptionRequest request) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isAdopter = request.getAdopter().getId().equals(currentUser.getId());
        boolean isOwner = request.getPet().getOwner().getId().equals(currentUser.getId());
        if (!isAdmin && !isAdopter && !isOwner) {
            throw new BusinessException("You are not authorized to view this adoption request");
        }
    }
}
