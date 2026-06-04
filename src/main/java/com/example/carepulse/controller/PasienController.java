package com.example.carepulse.controller;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.*;
import com.example.carepulse.service.JanjiTemuService;
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
    @Autowired private JanjiTemuService janjiTemuService;

    // FITUR BARU 1: Mengambil daftar poliklinik untuk frontend
    @GetMapping("/list-poli")
    public ResponseEntity<?> getDaftarPoli() {
        return ResponseEntity.ok(poliklinikRepository.findAll());
    }

    // FITUR BARU 2: Mengambil jadwal dokter berdasarkan poli yang dipilih
    @GetMapping("/jadwal-dokter/{poliId}")
    public ResponseEntity<?> getJadwalByPoli(@PathVariable Long poliId) {
        return ResponseEntity.ok(jadwalPraktikRepository.findByDokter_Poliklinik_Id(poliId));
    }

    // FITUR BARU 3: Mengambil riwayat janji temu pasien (Rekam Medis)
    @GetMapping("/riwayat/{pasienId}")
    public ResponseEntity<?> getRiwayatPasien(@PathVariable Long pasienId) {
        Pasien pasien = pasienRepository.findById(pasienId).orElse(null);
        if (pasien == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Pasien tidak ditemukan"));
        }
        return ResponseEntity.ok(janjiTemuRepository.findByPasien(pasien));
    }

    // FITUR EKSISTING: Booking Jadwal (Sudah terhubung ke JanjiTemuService)
    @PostMapping("/booking")
    public ResponseEntity<?> buatJanjiTemu(@RequestBody Map<String, String> data) {
        try {
            Long pasienId = Long.parseLong(data.get("pasienId"));
            Long jadwalId = Long.parseLong(data.get("jadwalId"));
            LocalDate tanggal = LocalDate.parse(data.get("tanggalKunjungan"));
            String keluhan = data.get("keluhan");

            JanjiTemu tiket = janjiTemuService.prosesBooking(pasienId, jadwalId, tanggal, keluhan);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "kodeTiket", tiket.getKodeTiket(),
                    "nomorAntrean", tiket.getNomorAntreanUrut(),
                    "janjiId", tiket.getId(),
                    "message", "BERHASIL! Anda mendapat Antrean Nomor " + tiket.getNomorAntreanUrut() + "."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
