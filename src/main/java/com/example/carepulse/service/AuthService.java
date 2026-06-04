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
import org.springframework.beans.factory.annotation.Autowired;
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

    public LoginResponse prosesLogin(LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        // 1. Cek Admin
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (admin.getPassword().equals(password)) {
                String token = "jwt-token-rahasia-" + admin.getId();
                // PERBAIKAN: Menambahkan admin.getId() di akhir
                return new LoginResponse(token, admin.getEmail(), admin.getNama(), "ADMIN", admin.getId());
            }
            throw new RuntimeException("Kata sandi salah.");
        }

        // 2. Cek Dokter
        Optional<Dokter> dokterOpt = dokterRepository.findByEmail(email);
        if (dokterOpt.isPresent()) {
            Dokter dokter = dokterOpt.get();
            if (dokter.getPassword().equals(password)) {
                String token = "jwt-token-rahasia-" + dokter.getId();
                // PERBAIKAN: Menambahkan dokter.getId() di akhir
                return new LoginResponse(token, dokter.getEmail(), dokter.getNamaLengkap(), "DOKTER", dokter.getId());
            }
            throw new RuntimeException("Kata sandi salah.");
        }

        // 3. Cek Staf Poli
        Optional<PegawaiPoli> stafOpt = pegawaiPoliRepository.findByEmail(email);
        if (stafOpt.isPresent()) {
            PegawaiPoli staf = stafOpt.get();
            if (staf.getPassword().equals(password)) {
                String token = "jwt-token-rahasia-" + staf.getId();
                // PERBAIKAN: Menambahkan staf.getId() di akhir
                return new LoginResponse(token, staf.getEmail(), staf.getNamaLengkap(), "STAF_POLI", staf.getId());
            }
            throw new RuntimeException("Kata sandi salah.");
        }

        // 4. Cek Pasien
        Optional<Pasien> pasienOpt = pasienRepository.findByEmail(email);
        if (pasienOpt.isPresent()) {
            Pasien pasien = pasienOpt.get();
            if (pasien.getPassword().equals(password)) {
                String token = "jwt-token-rahasia-" + pasien.getId();
                // PERBAIKAN: Menambahkan pasien.getId() di akhir
                return new LoginResponse(token, pasien.getEmail(), pasien.getNamaLengkap(), "PASIEN", pasien.getId());
            }
            throw new RuntimeException("Kata sandi salah.");
        }

        throw new RuntimeException("Email tidak terdaftar di sistem.");
    }
}
