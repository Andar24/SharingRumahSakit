package com.example.carepulse.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "pasiens")
public class Pasien extends User {

    @Column(unique = true, length = 16)
    private String nik;

    private LocalDate tanggalLahir;
    private String jenisKelamin;
    private String golonganDarah;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "akun_utama_id")
    @JsonIgnore
    private Pasien akunUtama;

    @OneToMany(mappedBy = "akunUtama", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Pasien> anggotaKeluarga;

    public Pasien() {}

    // 1. CONSTRUCTOR REGISTER WEB (Yang baru kita buat untuk login)
    public Pasien(String email, String password, String namaLengkap, String nik, LocalDate tanggalLahir, String jenisKelamin) {
        super(email, password, "PASIEN", namaLengkap);
        this.nik = nik;
        this.tanggalLahir = tanggalLahir;
        this.jenisKelamin = jenisKelamin;
        this.golonganDarah = "-";
    }

    // 2. CONSTRUCTOR LAMA (Untuk DataSeeder agar tidak error)
    public Pasien(String email, String password, String namaLengkap, String golonganDarah) {
        super(email, password, "PASIEN", namaLengkap);
        this.golonganDarah = golonganDarah;
    }

    // 3. CONSTRUCTOR KHUSUS ANAK (Untuk memperbaiki error di PasienController baris 25)
    public Pasien(String namaLengkap, String nik, LocalDate tanggalLahir, String jenisKelamin, String golonganDarah, Pasien akunUtama) {
        // Otomatis membuat email dummy agar tidak bentrok di sistem User
        super(nik + "@keluarga.carepulse.system", "NO_LOGIN", "PASIEN", namaLengkap);
        this.nik = nik;
        this.tanggalLahir = tanggalLahir;
        this.jenisKelamin = jenisKelamin;
        this.golonganDarah = golonganDarah;
        this.akunUtama = akunUtama;
    }

    // --- Getters & Setters ---
    public String getNik() { return nik; }
    public void setNik(String nik) { this.nik = nik; }

    public LocalDate getTanggalLahir() { return tanggalLahir; }
    public void setTanggalLahir(LocalDate tanggalLahir) { this.tanggalLahir = tanggalLahir; }

    public String getJenisKelamin() { return jenisKelamin; }
    public void setJenisKelamin(String jenisKelamin) { this.jenisKelamin = jenisKelamin; }

    public String getGolonganDarah() { return golonganDarah; }
    public void setGolonganDarah(String golonganDarah) { this.golonganDarah = golonganDarah; }

    public Pasien getAkunUtama() { return akunUtama; }
    public void setAkunUtama(Pasien akunUtama) { this.akunUtama = akunUtama; }

    public List<Pasien> getAnggotaKeluarga() { return anggotaKeluarga; }
    public void setAnggotaKeluarga(List<Pasien> anggotaKeluarga) { this.anggotaKeluarga = anggotaKeluarga; }
}