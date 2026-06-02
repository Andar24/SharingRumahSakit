package com.example.carepulse.controller;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/dokter")
public class DokterController {

    @Autowired private UserRepository userRepository;
    @Autowired private JadwalPraktikRepository jadwalPraktikRepository;

    @PostMapping("/add-jadwal")
    public ResponseEntity<?> addJadwal(@RequestBody Map<String, String> data) {
        Dokter dokter = (Dokter) userRepository.findByEmail(data.get("email")).orElse(null);
        if (dokter == null) return ResponseEntity.badRequest().body(Map.of("message", "Dokter tidak ditemukan"));

        JadwalPraktik jp = new JadwalPraktik(
                dokter, data.get("hari"),
                LocalTime.parse(data.get("jamMulai")), LocalTime.parse(data.get("jamSelesai")),
                Integer.parseInt(data.get("kuota"))
        );
        jadwalPraktikRepository.save(jp);
        return ResponseEntity.ok(Map.of("message", "Jadwal Praktik berhasil ditambahkan!"));
    }
}