package com.home4pet.service;

import com.home4pet.dto.request.CreateReviewRequest;
import com.home4pet.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    Page<ReviewResponse> getPetReviews(Long petId, Pageable pageable);

    Page<ReviewResponse> getMyReviews(Pageable pageable);

    void deleteReview(Long id);
}
