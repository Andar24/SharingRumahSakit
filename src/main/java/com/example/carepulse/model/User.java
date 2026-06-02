package com.example.carepulse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    private String namaLengkap;

    // 1. CONSTRUCTOR KOSONG (Wajib ada untuk Spring Boot)
    public User() {}

    // 2. CONSTRUCTOR BERPARAMETER (Ini yang dicari oleh baris 'super(...)' di Pasien.java & Dokter.java!)
    public User(String email, String password, String role, String namaLengkap) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.namaLengkap = namaLengkap;
    }

    // ==========================================
    // GETTERS & SETTERS
    // ==========================================
    public Long getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getNamaLengkap() { return namaLengkap; }
    public void setNamaLengkap(String namaLengkap) { this.namaLengkap = namaLengkap; }
}