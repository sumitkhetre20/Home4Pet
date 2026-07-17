package com.home4pet.controller;

import com.home4pet.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("service", "home4pet-backend");
        details.put("status", "UP");
        details.put("database", checkDatabase());

        return ResponseEntity.ok(ApiResponse.success("Home4Pet API is running", details));
    }

    private String checkDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2) ? "UP" : "DOWN";
        } catch (Exception ex) {
            return "DOWN";
        }
    }
}
