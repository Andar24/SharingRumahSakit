package com.example.carepulse.controller;

import com.example.carepulse.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller untuk testing JWT Authentication
 * Endpoint ini bisa dihapus di production
 */
@RestController
@RequestMapping("/api/test")
public class TestAuthController {

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Test endpoint - Cek apakah JWT token valid
     * GET /api/test/me
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        String email = securityUtils.getCurrentUserEmail(request);
        String role = securityUtils.getCurrentUserRole(request);
        Long userId = securityUtils.getCurrentUserId(request);
        
        if (email != null) {
            response.put("success", true);
            response.put("email", email);
            response.put("role", role);
            response.put("userId", userId);
            response.put("message", "Token valid!");
        } else {
            response.put("success", false);
            response.put("message", "Token tidak ditemukan atau tidak valid");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint - Hanya bisa diakses oleh ADMIN
     * GET /api/test/admin-only
     */
    @GetMapping("/admin-only")
    public ResponseEntity<Map<String, Object>> adminOnly(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (securityUtils.isAdmin(request)) {
            response.put("success", true);
            response.put("message", "Selamat datang, Admin!");
            response.put("email", securityUtils.getCurrentUserEmail(request));
        } else {
            response.put("success", false);
            response.put("message", "Akses ditolak. Hanya untuk ADMIN.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint - Hanya bisa diakses oleh DOKTER
     * GET /api/test/dokter-only
     */
    @GetMapping("/dokter-only")
    public ResponseEntity<Map<String, Object>> dokterOnly(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (securityUtils.isDokter(request)) {
            response.put("success", true);
            response.put("message", "Selamat datang, Dokter!");
            response.put("email", securityUtils.getCurrentUserEmail(request));
        } else {
            response.put("success", false);
            response.put("message", "Akses ditolak. Hanya untuk DOKTER.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint - Public (tidak perlu auth)
     * GET /api/test/public
     */
    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> publicEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Endpoint public - bisa diakses tanpa auth");
        return ResponseEntity.ok(response);
    }
}
