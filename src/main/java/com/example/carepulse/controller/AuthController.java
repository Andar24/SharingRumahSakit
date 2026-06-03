package com.example.carepulse.controller;

import com.example.carepulse.dto.LoginRequest;
import com.example.carepulse.dto.LoginResponse;
import com.example.carepulse.model.User;
import com.example.carepulse.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        if (user != null) {
            LoginResponse response = new LoginResponse();
            response.setStatus("success");
            response.setMessage("Login berhasil");
            response.setRole(user.getRole().toString().toLowerCase());
            response.setUserId(user.getId());
            response.setName(user.getNama());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new LoginResponse("error", "Email atau password salah", null, null, null));
    }
}
