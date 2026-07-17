package com.home4pet.service.impl;

import com.home4pet.client.GroqApiClient;
import com.home4pet.client.dto.GroqChatRequest;
import com.home4pet.config.GroqProperties;
import com.home4pet.dto.request.ChatMessageRequest;
import com.home4pet.dto.response.ChatMessageResponse;
import com.home4pet.entity.ChatMessage;
import com.home4pet.entity.User;
import com.home4pet.enums.MessageRole;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.DomainMapper;
import com.home4pet.repository.ChatMessageRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.service.ChatService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final DomainMapper domainMapper;
    private final GroqApiClient groqApiClient;
    private final GroqProperties groqProperties;

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        ChatMessage userMessage = ChatMessage.builder()
                .user(user)
                .role(MessageRole.USER)
                .content(request.getMessage())
                .build();
        chatMessageRepository.save(userMessage);

        List<GroqChatRequest.GroqMessage> conversation = buildConversationContext(userId);
        String assistantReply = groqApiClient.generateReply(conversation);

        ChatMessage assistantMessage = ChatMessage.builder()
                .user(user)
                .role(MessageRole.ASSISTANT)
                .content(assistantReply)
                .build();

        return domainMapper.toResponse(chatMessageRepository.save(assistantMessage));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getChatHistory(Pageable pageable) {
        return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(SecurityUtils.getCurrentUserId(), pageable)
                .map(domainMapper::toResponse);
    }

    @Override
    @Transactional
    public void clearHistory() {
        chatMessageRepository.deleteByUserId(SecurityUtils.getCurrentUserId());
    }

    private List<GroqChatRequest.GroqMessage> buildConversationContext(Long userId) {
        Pageable pageable = PageRequest.of(
                0,
                groqProperties.getMaxHistoryMessages(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        List<ChatMessage> recentMessages = chatMessageRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);

        Collections.reverse(recentMessages);

        return recentMessages.stream()
                .map(msg -> GroqChatRequest.GroqMessage.builder()
                        .role(msg.getRole().name().toLowerCase())
                        .content(msg.getContent())
                        .build())
                .toList();
    }
}
