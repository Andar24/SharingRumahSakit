package com.example.carepulse.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String nama;
    private String role;
    private Long id; // WAJIB ADA UNTUK TARIK DATA

    public LoginResponse(String token, String email, String nama, String role, Long id) {
        this.token = token;
        this.email = email;
        this.nama = nama;
        this.role = role;
        this.id = id;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getNama() { return nama; }
    public String getRole() { return role; }
    public Long getId() { return id; }
}
