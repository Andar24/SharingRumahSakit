package com.example.carepulse.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    // Menangani rute beranda utama
    @GetMapping("/")
    public String index() {
        return "index";
    }

    // Forwarder untuk rute SPA Frontend agar tidak memicu 404 saat di-refresh browser
    @GetMapping({"/admin", "/pasien", "/dokter", "/staf-poli", "/login", "/register"})
    public String forwardToRoute() {
        return "forward:/";
    }
}
