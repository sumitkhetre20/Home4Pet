package com.home4pet.controller;

import com.home4pet.common.pagination.PageResponse;
import com.home4pet.common.response.ApiResponse;
import com.home4pet.constants.AppConstants;
import com.home4pet.dto.request.ChatMessageRequest;
import com.home4pet.dto.response.ChatMessageResponse;
import com.home4pet.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.success(chatService.sendMessage(request)));
    }

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<PageResponse<ChatMessageResponse>>> getChatHistory(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(chatService.getChatHistory(pageable))));
    }

    @DeleteMapping("/messages")
    public ResponseEntity<ApiResponse<Void>> clearHistory() {
        chatService.clearHistory();
        return ResponseEntity.ok(ApiResponse.success("Chat history cleared"));
    }
}
