package com.example.carepulse.controller;

import com.example.carepulse.dto.LoginRequest;
import com.example.carepulse.dto.LoginResponse;
import com.example.carepulse.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // Wajib @RestController agar me-return JSON, bukan mencari file HTML
@RequestMapping("/api") // Prefix yang sama dengan variabel BASE_URL di api.js
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Logika diserahkan ke Service
        LoginResponse responseData = authService.prosesLogin(request);

        // Return 200 OK beserta data JSON
        return ResponseEntity.ok(responseData);
    }
}