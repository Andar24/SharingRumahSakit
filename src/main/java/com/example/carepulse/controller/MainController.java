package com.example.carepulse.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/")
    public String index() { return "index"; }

    @GetMapping("/pasien")
    public String pasien() { return "pasien"; }

    @GetMapping("/dokter")
    public String dokter() { return "dokter"; }

    @GetMapping("/staf-poli")
    public String stafPoli() { return "staf-poli"; }

    // RUTE TERAKHIR: Halaman Admin Pusat
    @GetMapping("/admin")
    public String admin() { return "admin"; }
}