package com.example.carepulse.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Extract user email from JWT token in request
     */
    public String getCurrentUserEmail(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token != null) {
            return jwtUtil.extractEmail(token);
        }
        return null;
    }

    /**
     * Extract user role from JWT token in request
     */
    public String getCurrentUserRole(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token != null) {
            return jwtUtil.extractRole(token);
        }
        return null;
    }

    /**
     * Extract user ID from JWT token in request
     */
    public Long getCurrentUserId(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token != null) {
            return jwtUtil.extractUserId(token);
        }
        return null;
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * Check if current user has specific role
     */
    public boolean hasRole(HttpServletRequest request, String role) {
        String userRole = getCurrentUserRole(request);
        return userRole != null && userRole.equals(role);
    }

    /**
     * Check if current user is admin
     */
    public boolean isAdmin(HttpServletRequest request) {
        return hasRole(request, "ADMIN");
    }

    /**
     * Check if current user is dokter
     */
    public boolean isDokter(HttpServletRequest request) {
        return hasRole(request, "DOKTER");
    }
}
