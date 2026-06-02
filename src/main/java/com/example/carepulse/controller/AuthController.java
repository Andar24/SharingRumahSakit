package com.example.carepulse.controller;

import com.example.carepulse.model.Pasien;
import com.example.carepulse.model.User;
import com.example.carepulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // --- API LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(data.get("email"));

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getPassword().equals(data.get("password"))) {

                    Map<String, Object> res = new HashMap<>();
                    res.put("status", "success");

                    // Filter role untuk staff poli
                    String role = user.getRole();
                    if ("PEGAWAI_POLI".equals(role)) role = "POLI";

                    res.put("role", role);
                    res.put("nama", user.getNamaLengkap());
                    res.put("email", user.getEmail());

                    return ResponseEntity.ok(res); // 200 OK
                }
            }

            return ResponseEntity.status(401).body(Map.of("message", "Email atau Kata Sandi salah!"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Server Error: " + e.getMessage()));
        }
    }

    // --- API REGISTER ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        try {
            if (userRepository.existsByEmail(data.get("email"))) {
                return ResponseEntity.status(400).body(Map.of("message", "Email sudah terdaftar di sistem!"));
            }

            Pasien pasienBaru = new Pasien(
                    data.get("email"),
                    data.get("password"),
                    data.get("nama"),
                    data.get("nik"),
                    LocalDate.parse(data.get("tanggalLahir")),
                    data.get("jenisKelamin")
            );

            userRepository.save(pasienBaru);
            return ResponseEntity.ok(Map.of("status", "success"));

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", "Format pengisian formulir tidak valid."));
        }
    }
}