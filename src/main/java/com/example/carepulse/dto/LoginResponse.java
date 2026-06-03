package com.example.carepulse.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String nama;
    private String role;

    // Constructor harus menerima 4 parameter
    public LoginResponse(String token, String email, String nama, String role) {
        this.token = token;
        this.email = email;
        this.nama = nama;
        this.role = role;
    }

    // Getters
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getNama() { return nama; }
    public String getRole() { return role; }
}