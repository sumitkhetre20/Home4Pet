package com.home4pet.service;

import com.home4pet.dto.response.FavoriteResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FavoriteService {

    FavoriteResponse addFavorite(Long petId);

    void removeFavorite(Long petId);

    Page<FavoriteResponse> getMyFavorites(Pageable pageable);

    boolean isFavorite(Long petId);
}
