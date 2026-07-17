package com.home4pet.controller;

import com.home4pet.common.pagination.PageResponse;
import com.home4pet.common.response.ApiResponse;
import com.home4pet.constants.AppConstants;
import com.home4pet.dto.request.CreateAdoptionRequest;
import com.home4pet.dto.request.UpdateAdoptionRequestStatus;
import com.home4pet.dto.response.AdoptionRequestResponse;
import com.home4pet.enums.AdoptionRequestStatus;
import com.home4pet.service.AdoptionRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/adoption-requests")
@RequiredArgsConstructor
public class AdoptionRequestController {

    private final AdoptionRequestService adoptionRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<AdoptionRequestResponse>> createRequest(
            @Valid @RequestBody CreateAdoptionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Adoption request submitted", adoptionRequestService.createRequest(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdoptionRequestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adoptionRequestService.getById(id)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<AdoptionRequestResponse>>> getMyRequests(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(adoptionRequestService.getMyRequests(pageable))
        ));
    }

    @GetMapping("/received")
    public ResponseEntity<ApiResponse<PageResponse<AdoptionRequestResponse>>> getReceivedRequests(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(adoptionRequestService.getReceivedRequests(pageable))
        ));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AdoptionRequestResponse>>> getAllRequests(
            @RequestParam(required = false) AdoptionRequestStatus status,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(adoptionRequestService.getAllRequests(status, pageable))
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdoptionRequestResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdoptionRequestStatus request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Adoption request status updated",
                adoptionRequestService.updateStatus(id, request)
        ));
    }
}
