package com.home4pet.service;

import com.home4pet.dto.request.ChatMessageRequest;
import com.home4pet.dto.response.ChatMessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatService {

    ChatMessageResponse sendMessage(ChatMessageRequest request);

    Page<ChatMessageResponse> getChatHistory(Pageable pageable);

    void clearHistory();
}
