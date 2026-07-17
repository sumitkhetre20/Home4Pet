package com.home4pet.controller;

import com.home4pet.common.pagination.PageResponse;
import com.home4pet.common.response.ApiResponse;
import com.home4pet.constants.AppConstants;
import com.home4pet.dto.response.FavoriteResponse;
import com.home4pet.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{petId}")
    public ResponseEntity<ApiResponse<FavoriteResponse>> addFavorite(@PathVariable Long petId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Added to favorites", favoriteService.addFavorite(petId)));
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable Long petId) {
        favoriteService.removeFavorite(petId);
        return ResponseEntity.ok(ApiResponse.success("Removed from favorites"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<FavoriteResponse>>> getMyFavorites(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(favoriteService.getMyFavorites(pageable))));
    }

    @GetMapping("/{petId}/check")
    public ResponseEntity<ApiResponse<Boolean>> isFavorite(@PathVariable Long petId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.isFavorite(petId)));
    }
}
