package com.home4pet.service.impl;

import com.home4pet.dto.request.CreateReviewRequest;
import com.home4pet.dto.response.ReviewResponse;
import com.home4pet.entity.Pet;
import com.home4pet.entity.Review;
import com.home4pet.entity.User;
import com.home4pet.exception.BusinessException;
import com.home4pet.exception.DuplicateResourceException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.DomainMapper;
import com.home4pet.repository.PetRepository;
import com.home4pet.repository.ReviewRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.security.UserPrincipal;
import com.home4pet.service.ReviewService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final DomainMapper domainMapper;

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (reviewRepository.existsByUserIdAndPetId(userId, request.getPetId())) {
            throw new DuplicateResourceException("Review", "petId", request.getPetId());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", request.getPetId()));

        Review review = Review.builder()
                .user(user)
                .pet(pet)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return domainMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPetReviews(Long petId, Pageable pageable) {
        if (!petRepository.existsById(petId)) {
            throw new ResourceNotFoundException("Pet", "id", petId);
        }
        return reviewRepository.findByPetId(petId, pageable).map(domainMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyReviews(Pageable pageable) {
        return reviewRepository.findByUserId(SecurityUtils.getCurrentUserId(), pageable)
                .map(domainMapper::toResponse);
    }

    @Override
    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !review.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException("You are not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }
}
