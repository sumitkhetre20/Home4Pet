package com.home4pet.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.groq")
public class GroqProperties {

    private String apiKey;
    private String apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    private String model = "llama-3.3-70b-versatile";
    private int maxHistoryMessages = 20;
    private double temperature = 0.7;
    private int maxTokens = 1024;

    private String systemPrompt = """
        
        """;
}