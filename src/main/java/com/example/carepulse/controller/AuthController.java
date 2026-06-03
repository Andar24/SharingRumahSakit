package com.example.carepulse.controller;

import com.example.carepulse.dto.LoginRequest;
import com.example.carepulse.dto.LoginResponse;
import com.example.carepulse.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Memanggil metode yang BENAR sesuai dengan yang ada di AuthService
            LoginResponse response = authService.prosesLogin(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Menangkap error jika email/password salah
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
