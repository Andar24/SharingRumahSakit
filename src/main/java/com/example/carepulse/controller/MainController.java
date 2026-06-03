package com.example.carepulse.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    // Mengalihkan rute-rute navigasi SPA kembali ke index.html agar router.js yang memproses tampilannya
    @GetMapping({
        "/login", 
        "/register", 
        "/admin", 
        "/pasien", 
        "/dokter", 
        "/staf-poli"
    })
    public String forwardToSpaRouter() {
        return "forward:/";
    }
}
