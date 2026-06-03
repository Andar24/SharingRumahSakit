package com.example.carepulse.controller;

import com.example.carepulse.model.JanjiTemu;
import com.example.carepulse.repository.JanjiTemuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/layanan")
public class PoliDokterController {

    @Autowired
    private JanjiTemuRepository janjiTemuRepository;

    // 1. API Pegawai Poli Check-In Pasien
    @PostMapping("/check-in")
    public ResponseEntity<?> checkInPasien(@RequestBody Map<String, Object> data) {
        try {
            // PERBAIKAN: Parsing aman ke Long agar kebal dari error JSON
            Long janjiId = Long.parseLong(String.valueOf(data.get("janjiId")));
            Optional<JanjiTemu> janjiOpt = janjiTemuRepository.findById(janjiId);

            if (janjiOpt.isPresent()) {
                JanjiTemu janji = janjiOpt.get();
                janji.setStatus("TIBA_DI_POLI"); 
                janjiTemuRepository.save(janji);
                return ResponseEntity.ok(Collections.singletonMap("message", "Pasien berhasil di-ACC (Check-in)!"));
            }
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Data antrean tidak ditemukan."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Format janjiId tidak valid."));
        }
    }

    // 2. API Daftar Antrean (Milik Staf Poli)
    @GetMapping("/daftar-antrean")
    public ResponseEntity<?> getDaftarAntreanPoli() {
        return ResponseEntity.ok(janjiTemuRepository.findAll().stream()
                .filter(j -> !j.getStatus().equals("SELESAI"))
                .toList());
    }

    // 3. API Dokter Selesaikan Pemeriksaan & Isi Resep
    @PostMapping("/periksa-selesai")
    public ResponseEntity<?> selesaikanPemeriksaan(@RequestBody Map<String, Object> data) {
        try {
            Long janjiId = Long.parseLong(String.valueOf(data.get("janjiId")));
            Optional<JanjiTemu> janjiOpt = janjiTemuRepository.findById(janjiId);

            if (janjiOpt.isPresent()) {
                JanjiTemu janji = janjiOpt.get();
                janji.setStatus("SELESAI");

                String rekamMedis = "Keluhan Awal: " + janji.getKeluhan() +
                        " | Diagnosis: " + data.get("diagnosis") +
                        " | Resep Obat: " + data.get("resep");
                janji.setKeluhan(rekamMedis);

                janjiTemuRepository.save(janji);
                return ResponseEntity.ok(Collections.singletonMap("message", "Pemeriksaan selesai dan resep diterbitkan!"));
            }
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Data pasien tidak ditemukan."));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Terjadi kesalahan format data: " + e.getMessage()));
        }
    }
}
