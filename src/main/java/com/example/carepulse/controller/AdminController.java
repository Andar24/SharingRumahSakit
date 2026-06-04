package com.example.carepulse.controller;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private PoliklinikRepository poliklinikRepository;
    @Autowired private PasienRepository pasienRepository;
    @Autowired private DokterRepository dokterRepository;
    @Autowired private PegawaiPoliRepository pegawaiPoliRepository;
    @Autowired private JanjiTemuRepository janjiTemuRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // ==========================================
    // DASHBOARD STATS
    // ==========================================
    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalPasien = pasienRepository.count();
            long totalDokter = dokterRepository.count();
            long totalStaf = pegawaiPoliRepository.count();
            
            // Kunjungan bulan ini
            LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
            LocalDate endOfMonth = LocalDate.now();
            long kunjunganBulanIni = janjiTemuRepository.findAll().stream()
                .filter(j -> {
                    if (j.getTanggalKunjungan() == null) return false;
                    LocalDate tanggal = LocalDate.parse(j.getTanggalKunjungan());
                    return !tanggal.isBefore(startOfMonth) && !tanggal.isAfter(endOfMonth);
                })
                .count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPasien", totalPasien);
            stats.put("totalDokter", totalDokter);
            stats.put("totalStaf", totalStaf);
            stats.put("kunjunganBulanIni", kunjunganBulanIni);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Gagal memuat statistik", "error", e.getMessage()));
        }
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================
    @GetMapping("/list-users")
    public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String role) {
        try {
            List<Map<String, Object>> userList = new ArrayList<>();
            
            // Get all users from different tables
            if (role == null || role.equals("ALL") || role.equals("PASIEN")) {
                pasienRepository.findAll().forEach(p -> {
                    Map<String, Object> user = new HashMap<>();
                    user.put("id", p.getId());
                    user.put("nama", p.getNamaLengkap());
                    user.put("email", p.getEmail());
                    user.put("role", "PASIEN");
                    user.put("detail", "ID: CP-" + p.getId());
                    userList.add(user);
                });
            }
            
            if (role == null || role.equals("ALL") || role.equals("DOKTER") || role.equals("STAF")) {
                dokterRepository.findAll().forEach(d -> {
                    Map<String, Object> user = new HashMap<>();
                    user.put("id", d.getId());
                    user.put("nama", d.getNamaLengkap());
                    user.put("email", d.getEmail());
                    user.put("role", "DOKTER");
                    user.put("detail", d.getSpesialisasi());
                    userList.add(user);
                });
            }
            
            if (role == null || role.equals("ALL") || role.equals("STAF")) {
                pegawaiPoliRepository.findAll().forEach(s -> {
                    Map<String, Object> user = new HashMap<>();
                    user.put("id", s.getId());
                    user.put("nama", s.getNamaLengkap());
                    user.put("email", s.getEmail());
                    user.put("role", "STAF_POLI");
                    user.put("detail", s.getShiftKerja());
                    userList.add(user);
                });
            }
            
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Gagal memuat user list", "error", e.getMessage()));
        }
    }

    @PostMapping("/block-user/{userId}")
    public ResponseEntity<?> blockUser(@PathVariable Long userId) {
        try {
            // TODO: Implement actual user blocking logic
            // For now, just return success
            return ResponseEntity.ok(Map.of("message", "User berhasil diblokir"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Gagal memblokir user", "error", e.getMessage()));
        }
    }

    // ==========================================
    // POLIKLINIK MANAGEMENT
    // ==========================================
    @PostMapping("/add-poliklinik")
    public ResponseEntity<?> addPoliklinik(@RequestBody Map<String, String> data) {
        try {
            Poliklinik poli = new Poliklinik();
            poli.setNamaPoli(data.get("namaPoli"));
            poli.setLokasi(data.get("lokasi") != null ? data.get("lokasi") : "Lantai 1");
            
            poliklinikRepository.save(poli);
            return ResponseEntity.ok(Map.of("message", "Poliklinik berhasil ditambahkan!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Gagal menambahkan poliklinik", "error", e.getMessage()));
        }
    }

    @GetMapping("/list-poliklinik")
    public ResponseEntity<?> listPoli() {
        try {
            List<Map<String, Object>> poliList = new ArrayList<>();
            poliklinikRepository.findAll().forEach(p -> {
                Map<String, Object> poli = new HashMap<>();
                poli.put("id", p.getId());
                poli.put("namaPoli", p.getNamaPoli());
                poli.put("lokasi", p.getLokasi());
                poli.put("kepalaPoli", "-"); // TODO: Add kepala poli relation
                poliList.add(poli);
            });
            return ResponseEntity.ok(poliList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Gagal memuat poliklinik", "error", e.getMessage()));
        }
    }

    // ==========================================
    // STAFF MANAGEMENT
    // ==========================================
    @PostMapping("/add-dokter")
    public ResponseEntity<?> addDokter(@RequestBody Map<String, String> data) {
        try {
            // Check if email already exists
            if (dokterRepository.findByEmail(data.get("email")).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email sudah terdaftar!"));
            }

            Dokter dokter = new Dokter();
            dokter.setEmail(data.get("email"));
            dokter.setPassword(passwordEncoder.encode(data.get("password")));
            dokter.setNamaLengkap(data.get("nama"));
            dokter.setSpesialisasi(data.get("spesialisasi") != null ? data.get("spesialisasi") : "Umum");
            
            // Set poliklinik if provided
            if (data.get("poliId") != null) {
                Long poliId = Long.parseLong(data.get("poliId"));
                Poliklinik poli = poliklinikRepository.findById(poliId).orElse(null);
                dokter.setPoliklinik(poli);
            }
            
            dokterRepository.save(dokter);
            return ResponseEntity.ok(Map.of("message", "Akun Dokter berhasil ditambahkan!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Gagal menambahkan dokter", "error", e.getMessage()));
        }
    }

    @PostMapping("/add-poli")
    public ResponseEntity<?> addStafPoli(@RequestBody Map<String, String> data) {
        try {
            // Check if email already exists
            if (pegawaiPoliRepository.findByEmail(data.get("email")).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email sudah terdaftar!"));
            }

            PegawaiPoli staf = new PegawaiPoli();
            staf.setEmail(data.get("email"));
            staf.setPassword(passwordEncoder.encode(data.get("password")));
            staf.setNamaLengkap(data.get("nama"));
            staf.setShiftKerja(data.get("shiftKerja") != null ? data.get("shiftKerja") : "Shift Reguler");
            
            // Set poliklinik if provided
            if (data.get("poliId") != null) {
                Long poliId = Long.parseLong(data.get("poliId"));
                Poliklinik poli = poliklinikRepository.findById(poliId).orElse(null);
                staf.setPoliklinik(poli);
            }
            
            pegawaiPoliRepository.save(staf);
            return ResponseEntity.ok(Map.of("message", "Staf Poli berhasil ditambahkan!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Gagal menambahkan staf", "error", e.getMessage()));
        }
    }
}