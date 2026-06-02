package com.example.carepulse.repository;

import com.example.carepulse.model.JadwalPraktik;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JadwalPraktikRepository extends JpaRepository<JadwalPraktik, Long> {
    // Fungsi baru: Mencari jadwal dokter berdasarkan ID Poli yang dipilih Pasien
    List<JadwalPraktik> findByDokter_Poliklinik_Id(Long poliId);
}