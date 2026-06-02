package com.example.carepulse.repository;

import com.example.carepulse.model.JanjiTemu;
import com.example.carepulse.model.JadwalPraktik;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface JanjiTemuRepository extends JpaRepository<JanjiTemu, Long> {
    // Menghitung jumlah pasien yang sudah daftar di jadwal & tanggal tertentu
    long countByJadwalPraktikAndTanggalKunjungan(JadwalPraktik jadwalPraktik, LocalDate tanggalKunjungan);
}