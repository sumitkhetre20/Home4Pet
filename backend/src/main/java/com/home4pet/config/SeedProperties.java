package com.home4pet.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.seed")
public class SeedProperties {

    private boolean enabled;
    private String adminEmail;
    private String adminPassword;
}