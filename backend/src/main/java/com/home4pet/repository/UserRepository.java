package com.home4pet.repository;

import com.home4pet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "roles")
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = "roles")
    Page<User> findAll(Pageable pageable);
}
