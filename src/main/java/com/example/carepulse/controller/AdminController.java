package com.example.carepulse.controller;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private PoliklinikRepository poliklinikRepository;

    @PostMapping("/add-poliklinik")
    public ResponseEntity<?> addPoliklinik(@RequestBody Map<String, String> data) {
        Poliklinik poli = new Poliklinik(data.get("namaPoli"), data.get("lokasi"));
        poliklinikRepository.save(poli);
        return ResponseEntity.ok(Collections.singletonMap("message", "Poliklinik berhasil ditambahkan!"));
    }

    @GetMapping("/list-poliklinik")
    public ResponseEntity<?> listPoli() {
        return ResponseEntity.ok(poliklinikRepository.findAll());
    }

    @PostMapping("/add-dokter")
    public ResponseEntity<?> addDokter(@RequestBody Map<String, String> data) {
        if (userRepository.existsByEmail(data.get("email"))) return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Email terdaftar!"));

        Long poliId = Long.parseLong(data.get("poliId"));
        Poliklinik poli = poliklinikRepository.findById(poliId).orElse(null);

        Dokter dokter = new Dokter(data.get("email"), data.get("password"), data.get("nama"), "Spesialis", poli);
        userRepository.save(dokter);
        return ResponseEntity.ok(Collections.singletonMap("message", "Akun Dokter berhasil ditambahkan ke Database!"));
    }

    @PostMapping("/add-admin")
    public ResponseEntity<?> addAdmin(@RequestBody Map<String, String> data) {
        if (userRepository.existsByEmail(data.get("email"))) return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Email terdaftar!"));
        Admin admin = new Admin(data.get("email"), data.get("password"), data.get("nama"), "Manajemen Pusat");
        userRepository.save(admin);
        return ResponseEntity.ok(Collections.singletonMap("message", "Akun Admin berhasil ditambahkan!"));
    }

    @PostMapping("/add-poli")
    public ResponseEntity<?> addPoli(@RequestBody Map<String, String> data) {
        if (userRepository.existsByEmail(data.get("email"))) return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Email terdaftar!"));
        PegawaiPoli poli = new PegawaiPoli(data.get("email"), data.get("password"), data.get("nama"), "Shift Reguler", null);
        userRepository.save(poli);
        return ResponseEntity.ok(Collections.singletonMap("message", "Staf Poli berhasil ditambahkan!"));
    }
}