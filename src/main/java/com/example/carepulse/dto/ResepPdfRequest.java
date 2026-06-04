package com.example.carepulse.dto;

import java.time.LocalDate;
import java.util.List;

public class ResepPdfRequest {
    private String namaPasien;
    private String nomorRekamMedis;
    private String namaDokter;
    private String spesialisasi;
    private LocalDate tanggalPemeriksaan;
    private String diagnosis;
    private List<ObatItem> daftarObat;
    private String catatanTambahan;

    // Constructors
    public ResepPdfRequest() {}

    public ResepPdfRequest(String namaPasien, String nomorRekamMedis, String namaDokter, 
                          String spesialisasi, LocalDate tanggalPemeriksaan, String diagnosis,
                          List<ObatItem> daftarObat, String catatanTambahan) {
        this.namaPasien = namaPasien;
        this.nomorRekamMedis = nomorRekamMedis;
        this.namaDokter = namaDokter;
        this.spesialisasi = spesialisasi;
        this.tanggalPemeriksaan = tanggalPemeriksaan;
        this.diagnosis = diagnosis;
        this.daftarObat = daftarObat;
        this.catatanTambahan = catatanTambahan;
    }

    // Getters and Setters
    public String getNamaPasien() {
        return namaPasien;
    }

    public void setNamaPasien(String namaPasien) {
        this.namaPasien = namaPasien;
    }

    public String getNomorRekamMedis() {
        return nomorRekamMedis;
    }

    public void setNomorRekamMedis(String nomorRekamMedis) {
        this.nomorRekamMedis = nomorRekamMedis;
    }

    public String getNamaDokter() {
        return namaDokter;
    }

    public void setNamaDokter(String namaDokter) {
        this.namaDokter = namaDokter;
    }

    public String getSpesialisasi() {
        return spesialisasi;
    }

    public void setSpesialisasi(String spesialisasi) {
        this.spesialisasi = spesialisasi;
    }

    public LocalDate getTanggalPemeriksaan() {
        return tanggalPemeriksaan;
    }

    public void setTanggalPemeriksaan(LocalDate tanggalPemeriksaan) {
        this.tanggalPemeriksaan = tanggalPemeriksaan;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public List<ObatItem> getDaftarObat() {
        return daftarObat;
    }

    public void setDaftarObat(List<ObatItem> daftarObat) {
        this.daftarObat = daftarObat;
    }

    public String getCatatanTambahan() {
        return catatanTambahan;
    }

    public void setCatatanTambahan(String catatanTambahan) {
        this.catatanTambahan = catatanTambahan;
    }

    // Inner class untuk item obat
    public static class ObatItem {
        private String namaObat;
        private String dosis;
        private String frekuensi;
        private String durasi;

        public ObatItem() {}

        public ObatItem(String namaObat, String dosis, String frekuensi, String durasi) {
            this.namaObat = namaObat;
            this.dosis = dosis;
            this.frekuensi = frekuensi;
            this.durasi = durasi;
        }

        public String getNamaObat() {
            return namaObat;
        }

        public void setNamaObat(String namaObat) {
            this.namaObat = namaObat;
        }

        public String getDosis() {
            return dosis;
        }

        public void setDosis(String dosis) {
            this.dosis = dosis;
        }

        public String getFrekuensi() {
            return frekuensi;
        }

        public void setFrekuensi(String frekuensi) {
            this.frekuensi = frekuensi;
        }

        public String getDurasi() {
            return durasi;
        }

        public void setDurasi(String durasi) {
            this.durasi = durasi;
        }
    }
}
