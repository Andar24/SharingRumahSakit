package com.example.carepulse.controller;

import com.example.carepulse.model.Pasien;
import com.example.carepulse.model.User;
import com.example.carepulse.repository.PasienRepository;
// Pastikan Anda sudah membuat UserRepository (public interface UserRepository extends JpaRepository<User, Long>)
import com.example.carepulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasienRepository pasienRepository;

    // 1. KITA SUNTIKKAN MESIN ENKRIPSI BCRYPT DI SINI
    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==========================================
    // API PENDAFTARAN (REGISTER)
    // ==========================================
    @PostMapping("/register")
    public ResponseEntity<?> registerPasienBaru(@RequestBody Map<String, String> data) {
        try {
            // Cek apakah email sudah dipakai orang lain
            if (userRepository.findByEmail(data.get("email")).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email sudah terdaftar!"));
            }

            Pasien pasienBaru = new Pasien();
            pasienBaru.setNamaLengkap(data.get("nama"));
            pasienBaru.setEmail(data.get("email"));
            pasienBaru.setNik(data.get("nik"));
            pasienBaru.setTanggalLahir(LocalDate.parse(data.get("tanggalLahir")));
            pasienBaru.setJenisKelamin(data.get("jenisKelamin"));
            pasienBaru.setRole("PASIEN");

            // 2. PROSES ENKRIPSI: Ubah sandi "rahasia123" menjadi "$2a$10$xyz..."
            String sandiAsli = data.get("password");
            String sandiAcak = passwordEncoder.encode(sandiAsli);
            pasienBaru.setPassword(sandiAcak); // Simpan yang sudah diacak ke database

            pasienRepository.save(pasienBaru);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Pendaftaran berhasil!"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Gagal menyimpan data: " + e.getMessage()));
        }
    }

    // ==========================================
    // API MASUK SISTEM (LOGIN)
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> loginSystem(@RequestBody Map<String, String> data) {
        String emailMasuk = data.get("email");
        String passwordMasuk = data.get("password");

        Optional<User> userOpt = userRepository.findByEmail(emailMasuk);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 3. PROSES PENCOCOKAN: Jangan gunakan '==' atau '.equals()' untuk sandi!
            // Kita gunakan passwordEncoder.matches() agar mesin membandingkan teks asli vs teks acak
            if (passwordEncoder.matches(passwordMasuk, user.getPassword())) {

                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "email", user.getEmail(),
                        "nama", user.getNamaLengkap(),
                        "role", user.getRole()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Kata sandi salah!"));
            }
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Email tidak ditemukan!"));
    }
}