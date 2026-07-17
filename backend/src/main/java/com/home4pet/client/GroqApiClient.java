package com.home4pet.client;

import com.home4pet.client.dto.GroqChatRequest;
import com.home4pet.client.dto.GroqChatResponse;
import com.home4pet.config.GroqProperties;
import com.home4pet.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GroqApiClient {

    private final GroqProperties groqProperties;
    private final RestClient restClient;

    public String generateReply(List<GroqChatRequest.GroqMessage> conversationMessages) {
        if (!StringUtils.hasText(groqProperties.getApiKey())) {
            throw new BusinessException("Groq API key is not configured. Set GROQ_API_KEY environment variable.");
        }

        List<GroqChatRequest.GroqMessage> messages = new ArrayList<>();
        messages.add(GroqChatRequest.GroqMessage.builder()
                .role("system")
                .content(groqProperties.getSystemPrompt())
                .build());
        messages.addAll(conversationMessages);

        GroqChatRequest request = GroqChatRequest.builder()
                .model(groqProperties.getModel())
                .messages(messages)
                .temperature(groqProperties.getTemperature())
                .maxTokens(groqProperties.getMaxTokens())
                .build();

        try {
            GroqChatResponse response = restClient.post()
                    .uri(groqProperties.getApiUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + groqProperties.getApiKey())
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String body = new String(res.getBody().readAllBytes());
                        log.error("Groq API error: status={}, body={}", res.getStatusCode(), body);
                        throw new BusinessException("AI assistant is temporarily unavailable. Please try again later.");
                    })
                    .body(GroqChatResponse.class);

            if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
                throw new BusinessException("AI assistant returned an empty response. Please try again.");
            }

            String content = response.getChoices().get(0).getMessage().getContent();
            if (!StringUtils.hasText(content)) {
                throw new BusinessException("AI assistant returned an empty response. Please try again.");
            }

            return content.trim();
        } catch (RestClientException ex) {
            log.error("Failed to call Groq API", ex);
            throw new BusinessException("AI assistant is temporarily unavailable. Please try again later.");
        }
    }
}
