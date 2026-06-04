package com.example.carepulse.controller;

import com.example.carepulse.dto.LoginRequest;
import com.example.carepulse.dto.LoginResponse;
import com.example.carepulse.model.Pasien;
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Pasien pasien) {
        try {
            LoginResponse response = authService.registerPasien(pasien);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = authService.isEmailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            
            authService.changePassword(email, oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password berhasil diubah"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
