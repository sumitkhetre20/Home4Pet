package com.home4pet.util;

import com.home4pet.exception.UnauthorizedException;
import com.home4pet.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return principal;
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
