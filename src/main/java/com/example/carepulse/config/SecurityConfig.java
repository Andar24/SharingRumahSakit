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
            .csrf(csrf -> csrf.disable()) // Menonaktifkan CSRF untuk kelancaran fetch REST API JSON
            .cors(cors -> cors.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/static/**", "/css/**", "/js/**", "/*.js", "/*.css").permitAll()
                .requestMatchers("/api/auth/**", "/api/pasien/**", "/api/dokter/**", "/api/admin/**").permitAll()
                .anyRequest().permitAll()
            );
        return http.build();
    }
}
