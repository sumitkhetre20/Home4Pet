package com.home4pet.service.impl;

import com.home4pet.dto.response.FavoriteResponse;
import com.home4pet.entity.Favorite;
import com.home4pet.entity.Pet;
import com.home4pet.entity.User;
import com.home4pet.exception.DuplicateResourceException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.DomainMapper;
import com.home4pet.repository.FavoriteRepository;
import com.home4pet.repository.PetRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.service.FavoriteService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final DomainMapper domainMapper;

    @Override
    @Transactional
    public FavoriteResponse addFavorite(Long petId) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (favoriteRepository.existsByUserIdAndPetId(userId, petId)) {
            throw new DuplicateResourceException("Favorite", "petId", petId);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", petId));

        Favorite favorite = Favorite.builder()
                .user(user)
                .pet(pet)
                .build();

        return domainMapper.toResponse(favoriteRepository.save(favorite));
    }

    @Override
    @Transactional
    public void removeFavorite(Long petId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Favorite favorite = favoriteRepository.findByUserIdAndPetId(userId, petId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite", "petId", petId));
        favoriteRepository.delete(favorite);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FavoriteResponse> getMyFavorites(Pageable pageable) {
        return favoriteRepository.findByUserId(SecurityUtils.getCurrentUserId(), pageable)
                .map(domainMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(Long petId) {
        return favoriteRepository.existsByUserIdAndPetId(SecurityUtils.getCurrentUserId(), petId);
    }
}
