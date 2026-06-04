package com.example.carepulse.service;

import com.example.carepulse.dto.LoginRequest;
import com.example.carepulse.dto.LoginResponse;
import com.example.carepulse.model.Admin;
import com.example.carepulse.model.Dokter;
import com.example.carepulse.model.PegawaiPoli;
import com.example.carepulse.model.Pasien;
import com.example.carepulse.repository.AdminRepository;
import com.example.carepulse.repository.DokterRepository;
import com.example.carepulse.repository.PegawaiPoliRepository;
import com.example.carepulse.repository.PasienRepository;
import com.example.carepulse.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DokterRepository dokterRepository;

    @Autowired
    private PegawaiPoliRepository pegawaiPoliRepository;

    @Autowired
    private PasienRepository pasienRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse prosesLogin(LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        // 1. Cek Admin
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (passwordEncoder.matches(password, admin.getPassword())) {
                String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN", admin.getId());
                return new LoginResponse(token, admin.getEmail(), admin.getNama(), "ADMIN", admin.getId());
            }
            throw new RuntimeException("Kata sandi salah.");
        }

        // 2. Cek Dokter
        Optional<Dokter> dokterOpt = dokterRepository.findByEmail(email);
        if (dokterOpt.isPresent()) {
            Dokter dokter = dokterOpt.get();
            if (passwordEncoder.matches(password, dokter.getPassword())) {
                String token = jwtUtil.generateToken(dokter.getEmail(), "DOKTER", dokter.getId());
                return new LoginResponse(token, dokter.getEmail(), dokter.getNamaLengkap(), "DOKTER", dokter.getId());
            }
            throw new RuntimeException("Kata sandi salah.");
        }

        // 3. Cek Staf Poli
        Optional<PegawaiPoli> stafOpt = pegawaiPoliRepository.findByEmail(email);
        if (stafOpt.isPresent()) {
            PegawaiPoli staf = stafOpt.get();
            if (passwordEncoder.matches(password, staf.getPassword())) {
                String token = jwtUtil.generateToken(staf.getEmail(), "STAF_POLI", staf.getId());
                return new LoginResponse(token, staf.getEmail(), staf.getNamaLengkap(), "STAF_POLI", staf.getId());
            }
            throw new RuntimeException("Kata sandi salah.");
        }

        // 4. Cek Pasien
        Optional<Pasien> pasienOpt = pasienRepository.findByEmail(email);
        if (pasienOpt.isPresent()) {
            Pasien pasien = pasienOpt.get();
            if (passwordEncoder.matches(password, pasien.getPassword())) {
                String token = jwtUtil.generateToken(pasien.getEmail(), "PASIEN", pasien.getId());
                return new LoginResponse(token, pasien.getEmail(), pasien.getNamaLengkap(), "PASIEN", pasien.getId());
            }
            throw new RuntimeException("Kata sandi salah.");
        }

        throw new RuntimeException("Email tidak terdaftar di sistem.");
    }

    /**
     * Registrasi pasien baru dengan enkripsi password BCrypt dan auto-login
     */
    public LoginResponse registerPasien(Pasien pasien) {
        // Validasi email sudah ada atau belum
        if (isEmailExists(pasien.getEmail())) {
            throw new RuntimeException("Email sudah terdaftar. Gunakan email lain.");
        }

        // Hash password sebelum disimpan
        pasien.setPassword(passwordEncoder.encode(pasien.getPassword()));

        // Simpan pasien baru ke database
        Pasien savedPasien = pasienRepository.save(pasien);

        // Generate JWT token untuk auto-login
        String token = jwtUtil.generateToken(savedPasien.getEmail(), "PASIEN", savedPasien.getId());

        return new LoginResponse(
                token,
                savedPasien.getEmail(),
                savedPasien.getNamaLengkap(),
                "PASIEN",
                savedPasien.getId()
        );
    }

    /**
     * Cek apakah email sudah terdaftar di sistem (Admin, Dokter, Staf, atau Pasien)
     */
    public boolean isEmailExists(String email) {
        return adminRepository.findByEmail(email).isPresent()
                || dokterRepository.findByEmail(email).isPresent()
                || pegawaiPoliRepository.findByEmail(email).isPresent()
                || pasienRepository.findByEmail(email).isPresent();
    }

    /**
     * Ubah password user (berlaku untuk semua role)
     */
    public void changePassword(String email, String oldPassword, String newPassword) {
        // Cek di semua tabel user
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (!passwordEncoder.matches(oldPassword, admin.getPassword())) {
                throw new RuntimeException("Password lama tidak sesuai");
            }
            admin.setPassword(passwordEncoder.encode(newPassword));
            adminRepository.save(admin);
            return;
        }

        Optional<Dokter> dokterOpt = dokterRepository.findByEmail(email);
        if (dokterOpt.isPresent()) {
            Dokter dokter = dokterOpt.get();
            if (!passwordEncoder.matches(oldPassword, dokter.getPassword())) {
                throw new RuntimeException("Password lama tidak sesuai");
            }
            dokter.setPassword(passwordEncoder.encode(newPassword));
            dokterRepository.save(dokter);
            return;
        }

        Optional<PegawaiPoli> stafOpt = pegawaiPoliRepository.findByEmail(email);
        if (stafOpt.isPresent()) {
            PegawaiPoli staf = stafOpt.get();
            if (!passwordEncoder.matches(oldPassword, staf.getPassword())) {
                throw new RuntimeException("Password lama tidak sesuai");
            }
            staf.setPassword(passwordEncoder.encode(newPassword));
            pegawaiPoliRepository.save(staf);
            return;
        }

        Optional<Pasien> pasienOpt = pasienRepository.findByEmail(email);
        if (pasienOpt.isPresent()) {
            Pasien pasien = pasienOpt.get();
            if (!passwordEncoder.matches(oldPassword, pasien.getPassword())) {
                throw new RuntimeException("Password lama tidak sesuai");
            }
            pasien.setPassword(passwordEncoder.encode(newPassword));
            pasienRepository.save(pasien);
            return;
        }

        throw new RuntimeException("Email tidak ditemukan");
    }
}
