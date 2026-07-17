package com.home4pet.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String storePetImage(MultipartFile file);

    void deletePetImage(String url);
}
