package com.example.carepulse.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/")
    public String index() {
        return "index"; // Memuat index.html (Halaman Login)
    }

    @GetMapping("/admin")
    public String admin() {
        return "admin"; // Memuat admin.html
    }

    @GetMapping("/pasien")
    public String pasien() {
        return "pasien"; // Memuat pasien.html
    }

    @GetMapping("/dokter")
    public String dokter() {
        return "dokter"; // Memuat dokter.html
    }

    @GetMapping("/staf-poli")
    public String stafPoli() {
        return "staf-poli"; // Memuat staf-poli.html
    }
}
