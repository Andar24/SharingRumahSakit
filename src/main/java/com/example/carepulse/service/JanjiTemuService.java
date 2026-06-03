package com.example.carepulse.service;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class JanjiTemuService {

    @Autowired private JanjiTemuRepository janjiTemuRepository;
    @Autowired private PasienRepository pasienRepository;
    @Autowired private JadwalPraktikRepository jadwalPraktikRepository;

    // @Transactional memastikan jika terjadi error (misal mati lampu saat booking),
    // data setengah jadi tidak akan tersimpan di database (otomatis rollback).
    @Transactional
    public JanjiTemu prosesBooking(Long pasienId, Long jadwalId, LocalDate tanggal, String keluhan) throws Exception {

        // 1. Cek validasi data
        Pasien pasien = pasienRepository.findById(pasienId)
                .orElseThrow(() -> new Exception("Data Pasien tidak ditemukan di sistem!"));
        JadwalPraktik jadwal = jadwalPraktikRepository.findById(jadwalId)
                .orElseThrow(() -> new Exception("Jadwal Praktik tidak valid!"));

        // 2. Cek Kuota Antrean
        long antreanSekarang = janjiTemuRepository.countByJadwalPraktikAndTanggalKunjungan(jadwal, tanggal);
        if (antreanSekarang >= jadwal.getKuotaMaksimal()) {
            throw new Exception("MOHON MAAF, KUOTA PENUH! Sudah ada " + antreanSekarang + " pasien terdaftar.");
        }

        // 3. Logika Pembuatan Nomor Antrean & Tiket
        int nomorAntrean = (int) antreanSekarang + 1;

        JanjiTemu tiket = new JanjiTemu();
        tiket.setKodeTiket("CP-" + (System.currentTimeMillis() % 10000));
        tiket.setPasien(pasien);
        tiket.setDokter(jadwal.getDokter());
        tiket.setJadwalPraktik(jadwal);
        tiket.setTanggalKunjungan(tanggal);
        tiket.setStatus("MENUNGGU"); // Status awal
        tiket.setNomorAntreanUrut(nomorAntrean);
        tiket.setKeluhan(keluhan);

        // 4. Simpan ke Database
        return janjiTemuRepository.save(tiket);
    }
}