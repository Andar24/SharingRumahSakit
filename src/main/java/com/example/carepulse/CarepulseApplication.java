package com.example.carepulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CarepulseApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarepulseApplication.class, args);
        System.out.println("=============================================");
        System.out.println("✅ SERVER CAREPULSE BERHASIL MENYALA!");
        System.out.println("=============================================");
    }
}
