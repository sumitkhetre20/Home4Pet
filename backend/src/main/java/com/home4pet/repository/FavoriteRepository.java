package com.home4pet.repository;

import com.home4pet.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Page<Favorite> findByUserId(Long userId, Pageable pageable);

    Optional<Favorite> findByUserIdAndPetId(Long userId, Long petId);

    boolean existsByUserIdAndPetId(Long userId, Long petId);

    void deleteByPetId(Long petId);
}
