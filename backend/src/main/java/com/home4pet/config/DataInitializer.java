package com.home4pet.config;

import com.home4pet.entity.Role;
import com.home4pet.entity.User;
import com.home4pet.enums.RoleType;
import com.home4pet.repository.RoleRepository;
import com.home4pet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SeedProperties seedProperties;

    @Override
    public void run(String... args) {
        seedRoles();
        seedAdminUser();
    }

    private void seedRoles() {
        for (RoleType roleType : RoleType.values()) {
            roleRepository.findByName(roleType).orElseGet(() -> {
                Role role = Role.builder().name(roleType).build();
                log.info("Seeded role: {}", roleType);
                return roleRepository.save(role);
            });
        }
    }

    private void seedAdminUser() {
        String adminEmail = seedProperties.getAdminEmail();
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        Role adminRole = roleRepository.findByName(RoleType.ADMIN)
                .orElseThrow(() -> new IllegalStateException("ADMIN role must exist before seeding admin user"));

        User admin = User.builder()
                .email(adminEmail)
                .password(passwordEncoder.encode(seedProperties.getAdminPassword()))
                .firstName("System")
                .lastName("Admin")
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(admin);
        log.info("Default admin user created: {}", adminEmail);
    }
}
