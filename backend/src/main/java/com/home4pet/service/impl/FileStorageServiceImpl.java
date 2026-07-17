package com.home4pet.service.impl;

import com.home4pet.config.UploadProperties;
import com.home4pet.exception.BusinessException;
import com.home4pet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final UploadProperties uploadProperties;

    @Override
    public String storePetImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is empty");
        }

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BusinessException("Only JPG, PNG, and WEBP images are allowed");
        }

        try {
            Path uploadDir = Paths.get(uploadProperties.getDir(), "pets").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String filename = UUID.randomUUID() + "." + extension.toLowerCase();
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/pets/" + filename;
        } catch (IOException ex) {
            throw new BusinessException("Failed to store file: " + ex.getMessage());
        }
    }

    @Override
    public void deletePetImage(String url) {
        if (url == null || url.isBlank()) {
            return;
        }

        try {
            String filename = url.substring(url.lastIndexOf('/') + 1);
            Path filePath = Paths.get(uploadProperties.getDir(), "pets", filename).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new BusinessException("Failed to delete file: " + ex.getMessage());
        }
    }
}
