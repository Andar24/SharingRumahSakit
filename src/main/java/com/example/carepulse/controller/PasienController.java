package com.example.carepulse.controller;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@RestController
@RequestMapping("/api/pasien")
public class PasienController {

    @Autowired private PasienRepository pasienRepository;
    @Autowired private PoliklinikRepository poliklinikRepository;
    @Autowired private JadwalPraktikRepository jadwalPraktikRepository;
    @Autowired private JanjiTemuRepository janjiTemuRepository;

    @PostMapping("/add-keluarga")
    public ResponseEntity<?> tambahAnggotaKeluarga(@RequestBody Map<String, String> data) {
        Optional<Pasien> parentOpt = pasienRepository.findByEmail(data.get("emailParent"));
        if (parentOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Akun utama tidak ditemukan!"));
        Pasien anak = new Pasien(data.get("namaLengkap"), data.get("nik"), LocalDate.parse(data.get("tanggalLahir")), data.get("jenisKelamin"), data.get("golonganDarah"), parentOpt.get());
        pasienRepository.save(anak);
        return ResponseEntity.ok(Map.of("message", "Keluarga berhasil ditambahkan!"));
    }

    @GetMapping("/list-keluarga")
    public ResponseEntity<?> getListKeluarga(@RequestParam String emailParent) {
        Optional<Pasien> parentOpt = pasienRepository.findByEmail(emailParent);
        if (parentOpt.isEmpty()) return ResponseEntity.badRequest().build();
        Pasien parent = parentOpt.get();
        List<Map<String, Object>> response = new ArrayList<>();
        response.add(Map.of("id", parent.getId(), "nama", parent.getNamaLengkap() + " (Diri Sendiri)", "umur", Period.between(parent.getTanggalLahir(), LocalDate.now()).getYears()));
        pasienRepository.findByAkunUtama(parent).forEach(k -> response.add(Map.of("id", k.getId(), "nama", k.getNamaLengkap() + " (Keluarga)", "umur", Period.between(k.getTanggalLahir(), LocalDate.now()).getYears())));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list-poli")
    public ResponseEntity<?> getListPoli() {
        return ResponseEntity.ok(poliklinikRepository.findAll());
    }

    @GetMapping("/list-jadwal-poli")
    public ResponseEntity<?> getJadwalByPoli(@RequestParam Long poliId) {
        List<JadwalPraktik> jadwals = jadwalPraktikRepository.findByDokter_Poliklinik_Id(poliId);
        List<Map<String, Object>> response = new ArrayList<>();
        for (JadwalPraktik jp : jadwals) {
            response.add(Map.of("id", jp.getId(), "namaDokter", jp.getDokter().getNamaLengkap(), "hari", jp.getHari(), "jamMulai", jp.getJamMulai().toString(), "jamSelesai", jp.getJamSelesai().toString(), "kuotaMaksimal", jp.getKuotaMaksimal()));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/booking")
    public ResponseEntity<?> buatJanjiTemu(@RequestBody Map<String, String> data) {
        try {
            Pasien pasien = pasienRepository.findById(Long.parseLong(data.get("pasienId"))).orElseThrow(() -> new Exception("Pasien invalid!"));
            JadwalPraktik jadwal = jadwalPraktikRepository.findById(Long.parseLong(data.get("jadwalId"))).orElseThrow(() -> new Exception("Jadwal invalid!"));
            LocalDate tanggal = LocalDate.parse(data.get("tanggal"));

            long antreanSekarang = janjiTemuRepository.countByJadwalPraktikAndTanggalKunjungan(jadwal, tanggal);
            if (antreanSekarang >= jadwal.getKuotaMaksimal()) {
                return ResponseEntity.badRequest().body(Map.of("message", "KUOTA PENUH! Sudah ada " + antreanSekarang + " pasien terdaftar di tanggal ini."));
            }

            int nomorAntrean = (int) antreanSekarang + 1;

            JanjiTemu tiket = new JanjiTemu("CP-" + (System.currentTimeMillis() % 10000), pasien, jadwal.getDokter(), jadwal, tanggal, "Umum");
            tiket.setNomorAntreanUrut(nomorAntrean);
            tiket.setKeluhan(data.get("keluhan"));
            janjiTemuRepository.save(tiket);

            return ResponseEntity.ok(Map.of("status", "success", "kodeTiket", tiket.getKodeTiket(), "message", "BERHASIL! Anda mendapat Antrean Nomor " + nomorAntrean + ". Silakan datang pada " + jadwal.getJamMulai() + "."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}