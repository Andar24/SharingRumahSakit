package com.example.carepulse.controller;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.*;
import com.example.carepulse.service.JanjiTemuService; // IMPORT SERVICE BARU ANDA
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/pasien")
public class PasienController {

    @Autowired private PasienRepository pasienRepository;
    @Autowired private PoliklinikRepository poliklinikRepository;
    @Autowired private JadwalPraktikRepository jadwalPraktikRepository;
    @Autowired private JanjiTemuRepository janjiTemuRepository;

    // Panggil Service yang baru dibuat
    @Autowired private JanjiTemuService janjiTemuService;

    // ... (Fungsi GET Poli dan Jadwal biarkan tetap ada) ...

    // ==========================================
    // API Buat Janji Temu (Booking) - VERSI CLEAN
    // ==========================================
    @PostMapping("/booking")
    public ResponseEntity<?> buatJanjiTemu(@RequestBody Map<String, String> data) {
        try {
            Long pasienId = Long.parseLong(data.get("pasienId"));
            Long jadwalId = Long.parseLong(data.get("jadwalId"));
            LocalDate tanggal = LocalDate.parse(data.get("tanggal"));
            String keluhan = data.get("keluhan");

            // Lempar semua logika pusing ke Service Layer
            JanjiTemu tiket = janjiTemuService.prosesBooking(pasienId, jadwalId, tanggal, keluhan);

            // Jika sukses, kembalikan response JSON ke aplikasi Frontend
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "kodeTiket", tiket.getKodeTiket(),
                    "message", "BERHASIL! Anda mendapat Antrean Nomor " + tiket.getNomorAntreanUrut() + "."
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}