package com.example.carepulse.config;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner initDatabase(UserRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                // Akun default yang sudah ada
                repo.save(new Dokter("dr.julian@klinik.com", "123", "Dr. Julian", "Penyakit Dalam"));
                repo.save(new Pasien("alex@klinik.com", "123", "Alex Johnson", "O"));
                repo.save(new Admin("admin@klinik.com", "123", "Sarah Admin", "Operasional")); // Email admin disamakan dengan HTML

                // INI YANG KURANG: Menambahkan akun Staf Poli default!
                repo.save(new PegawaiPoli("poli@klinik.com", "123", "Staf Pendaftaran", "Shift Pagi", null));

                System.out.println("✅ Data Dummy Berhasil Dimasukkan ke Database!");
            }
        };
    }
}