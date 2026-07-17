package com.home4pet.repository;

import com.home4pet.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByPetId(Long petId, Pageable pageable);

    Page<Review> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndPetId(Long userId, Long petId);

    void deleteByPetId(Long petId);
}
