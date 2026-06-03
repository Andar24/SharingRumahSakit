package com.example.carepulse.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "artikel_medis")
public class Artikel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String judul;

    @Column(length = 2000)
    private String konten;

    private String namaPenulis;
    private LocalDate tanggalPublikasi;

    public Artikel() {}

    public Artikel(String judul, String konten, String namaPenulis) {
        this.judul = judul;
        this.konten = konten;
        this.namaPenulis = namaPenulis;
        this.tanggalPublikasi = LocalDate.now(); // Otomatis diset ke hari ini
    }

    // Getter dan Setter
    public Long getId() { return id; }
    public String getJudul() { return judul; }
    public void setJudul(String judul) { this.judul = judul; }
    public String getKonten() { return konten; }
    public void setKonten(String konten) { this.konten = konten; }
    public String getNamaPenulis() { return namaPenulis; }
    public void setNamaPenulis(String namaPenulis) { this.namaPenulis = namaPenulis; }
    public LocalDate getTanggalPublikasi() { return tanggalPublikasi; }
}