package com.home4pet.service;

import com.home4pet.dto.request.CreateAdoptionRequest;
import com.home4pet.dto.request.UpdateAdoptionRequestStatus;
import com.home4pet.dto.response.AdoptionRequestResponse;
import com.home4pet.enums.AdoptionRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdoptionRequestService {

    AdoptionRequestResponse createRequest(CreateAdoptionRequest request);

    AdoptionRequestResponse updateStatus(Long id, UpdateAdoptionRequestStatus request);

    AdoptionRequestResponse getById(Long id);

    Page<AdoptionRequestResponse> getMyRequests(Pageable pageable);

    Page<AdoptionRequestResponse> getReceivedRequests(Pageable pageable);

    Page<AdoptionRequestResponse> getAllRequests(AdoptionRequestStatus status, Pageable pageable);
}
