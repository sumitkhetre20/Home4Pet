package com.home4pet.repository;

import com.home4pet.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId, Pageable pageable);

    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ChatMessage c WHERE c.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
