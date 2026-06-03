package com.example.carepulse.controller;

import com.example.carepulse.model.Artikel;
import com.example.carepulse.repository.ArtikelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/artikel")
public class ArtikelController {

    @Autowired
    private ArtikelRepository artikelRepository;

    // 1. API untuk menyimpan artikel baru dari Admin
    @PostMapping("/tambah")
    public ResponseEntity<?> tambahArtikel(@RequestBody Artikel artikel) {
        // Tanggal publikasi sudah otomatis diset di Constructor model Artikel
        artikelRepository.save(artikel);
        return ResponseEntity.ok(Collections.singletonMap("message", "Artikel medis berhasil dipublikasikan ke Beranda!"));
    }

    // 2. API untuk mengambil semua artikel untuk ditampilkan di Beranda
    @GetMapping("/list")
    public ResponseEntity<?> listArtikel() {
        return ResponseEntity.ok(artikelRepository.findAll());
    }
}