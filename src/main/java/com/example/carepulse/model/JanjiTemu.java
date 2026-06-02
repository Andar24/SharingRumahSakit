package com.example.carepulse.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "janji_temu")
public class JanjiTemu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String kodeTiket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pasien_id")
    private Pasien pasien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dokter_id")
    private Dokter dokter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jadwal_id")
    private JadwalPraktik jadwalPraktik;

    private LocalDate tanggalKunjungan;
    private String status;

    private Integer nomorAntreanUrut;

    @Column(length = 500)
    private String keluhan;

    public JanjiTemu() {}

    public JanjiTemu(String kodeTiket, Pasien pasien, Dokter dokter, JadwalPraktik jadwalPraktik, LocalDate tanggalKunjungan, String status) {
        this.kodeTiket = kodeTiket;
        this.pasien = pasien;
        this.dokter = dokter;
        this.jadwalPraktik = jadwalPraktik;
        this.tanggalKunjungan = tanggalKunjungan;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getKodeTiket() { return kodeTiket; }
    public void setKodeTiket(String kodeTiket) { this.kodeTiket = kodeTiket; }

    public Pasien getPasien() { return pasien; }
    public void setPasien(Pasien pasien) { this.pasien = pasien; }

    public Dokter getDokter() { return dokter; }
    public void setDokter(Dokter dokter) { this.dokter = dokter; }

    public JadwalPraktik getJadwalPraktik() { return jadwalPraktik; }
    public void setJadwalPraktik(JadwalPraktik jadwalPraktik) { this.jadwalPraktik = jadwalPraktik; }

    public LocalDate getTanggalKunjungan() { return tanggalKunjungan; }
    public void setTanggalKunjungan(LocalDate tanggalKunjungan) { this.tanggalKunjungan = tanggalKunjungan; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getNomorAntreanUrut() { return nomorAntreanUrut; }
    public void setNomorAntreanUrut(Integer nomorAntreanUrut) { this.nomorAntreanUrut = nomorAntreanUrut; }

    public String getKeluhan() { return keluhan; }
    public void setKeluhan(String keluhan) { this.keluhan = keluhan; }
}