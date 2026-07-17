package com.home4pet.repository;

import com.home4pet.entity.AdoptionRequest;
import com.home4pet.enums.AdoptionRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {

    Page<AdoptionRequest> findByAdopterId(Long adopterId, Pageable pageable);

    Page<AdoptionRequest> findByPet_OwnerId(Long ownerId, Pageable pageable);

    Page<AdoptionRequest> findByStatus(AdoptionRequestStatus status, Pageable pageable);

    Optional<AdoptionRequest> findByPetIdAndAdopterIdAndStatus(Long petId, Long adopterId, AdoptionRequestStatus status);

    boolean existsByPetIdAndAdopterIdAndStatusIn(Long petId, Long adopterId, Collection<AdoptionRequestStatus> statuses);

    boolean existsByPetIdAndStatusIn(Long petId, Collection<AdoptionRequestStatus> statuses);

    Optional<AdoptionRequest> findFirstByPetIdAndAdopterIdAndStatus(Long petId, Long adopterId, AdoptionRequestStatus status);

    List<AdoptionRequest> findByPetIdAndStatusIn(Long petId, Collection<AdoptionRequestStatus> statuses);

    long countByStatus(AdoptionRequestStatus status);

    void deleteByPetId(Long petId);
}
