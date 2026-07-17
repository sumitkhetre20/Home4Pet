package com.home4pet.repository;

import com.home4pet.entity.Pet;
import com.home4pet.enums.PetSpecies;
import com.home4pet.enums.PetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PetRepository extends JpaRepository<Pet, Long> {

    Page<Pet> findByStatus(PetStatus status, Pageable pageable);

    Page<Pet> findByOwnerId(Long ownerId, Pageable pageable);

    long countByStatus(PetStatus status);

    @Query("""
            SELECT p FROM Pet p
            WHERE (:species IS NULL OR p.species = :species)
            AND (:status IS NULL OR p.status = :status)
            AND (:city IS NULL OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%')))
            AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(p.breed) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Pet> searchPets(
            @Param("species") PetSpecies species,
            @Param("status") PetStatus status,
            @Param("city") String city,
            @Param("search") String search,
            Pageable pageable
    );
}
