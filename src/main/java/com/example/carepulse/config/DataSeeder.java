package com.example.carepulse.config;

import com.example.carepulse.model.*;
import com.example.carepulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Bean
    CommandLineRunner initDatabase(UserRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                // Hash password default: "123" menjadi BCrypt hash
                String hashedPassword = passwordEncoder.encode("123");
                
                // Akun default dengan password yang di-hash
                repo.save(new Dokter("dr.julian@klinik.com", hashedPassword, "Dr. Julian", "Penyakit Dalam"));
                repo.save(new Pasien("alex@klinik.com", hashedPassword, "Alex Johnson", "O"));
                repo.save(new Admin("admin@klinik.com", hashedPassword, "Sarah Admin", "Operasional"));
                repo.save(new PegawaiPoli("poli@klinik.com", hashedPassword, "Staf Pendaftaran", "Shift Pagi", null));

                System.out.println("✅ Data Dummy dengan BCrypt Password Berhasil Dimasukkan ke Database!");
                System.out.println("📝 Password default untuk semua user: 123");
            }
        };
    }
}