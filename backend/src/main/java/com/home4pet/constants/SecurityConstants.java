package com.home4pet.constants;

public final class SecurityConstants {

    private SecurityConstants() {
    }

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_AUTHORIZATION = "Authorization";

    public static final String[] PUBLIC_URLS = {
            "/auth/**",
            "/health",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    };
}
