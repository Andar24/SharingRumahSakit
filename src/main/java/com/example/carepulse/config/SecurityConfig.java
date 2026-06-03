package com.example.carepulse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable())
            .authorizeHttpRequests(auth -> auth
                // Izinkan semua file statis di root folder static
                .requestMatchers("/", "/index.html", "/*.js", "/*.css", "/static/**", "/css/**", "/js/**").permitAll()
                // Izinkan semua jalur API backend komunikasi JSON
                .requestMatchers("/api/**", "/api/auth/**", "/api/pasien/**", "/api/dokter/**").permitAll()
                .anyRequest().permitAll()
            );
        return http.build();
    }
}
