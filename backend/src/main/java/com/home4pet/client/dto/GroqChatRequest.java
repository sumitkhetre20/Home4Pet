package com.home4pet.client.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroqChatRequest {

    private String model;
    private List<GroqMessage> messages;
    private double temperature;

    @JsonProperty("max_tokens")
    private int maxTokens;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroqMessage {
        private String role;
        private String content;
    }
}
