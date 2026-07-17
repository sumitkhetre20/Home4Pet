package com.home4pet.dto.response;

import com.home4pet.enums.MessageRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private Long id;
    private MessageRole role;
    private String content;
    private LocalDateTime createdAt;
}
