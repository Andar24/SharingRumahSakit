package com.example.carepulse.service;

import com.example.carepulse.dto.LoginRequest;
import com.example.carepulse.dto.LoginResponse;
import com.example.carepulse.model.User;
import com.example.carepulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponse prosesLogin(LoginRequest request) {
        // 1. Cari user berdasarkan email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email tidak terdaftar di sistem."));

        // 2. Verifikasi Password
        // (Catatan: Saat ini masih mengecek teks asli. Jika nanti pakai BCrypt, ganti dengan passwordEncoder.matches)
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Kata sandi yang Anda masukkan salah.");
        }

        // 3. Buat Simulasi Token JWT
        String dummyToken = "jwt-token-rahasia-" + user.getId();

        // 4. Kembalikan data lengkap untuk frontend
        // Pastikan urutan ini sesuai dengan urutan constructor di file LoginResponse.java Anda
        return new LoginResponse(
                dummyToken,              // Token untuk sesi JS
                user.getEmail(),         // Email user
                user.getNamaLengkap(),   // Menggunakan getNamaLengkap(), bukan getNama()
                user.getRole()           // Peran (PASIEN, DOKTER, dll)
        );
    }
}