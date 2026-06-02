package com.example.carepulse.repository;

import com.example.carepulse.model.JanjiTemu;
import com.example.carepulse.model.JadwalPraktik;
import com.example.carepulse.model.Pasien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JanjiTemuRepository extends JpaRepository<JanjiTemu, Long> {

    // Menghitung jumlah pasien yang sudah daftar di jadwal & tanggal tertentu
    long countByJadwalPraktikAndTanggalKunjungan(JadwalPraktik jadwalPraktik, LocalDate tanggalKunjungan);

    // TAMBAHAN BARU: Mengambil semua riwayat janji temu/kunjungan milik seorang pasien
    List<JanjiTemu> findByPasien(Pasien pasien);
}