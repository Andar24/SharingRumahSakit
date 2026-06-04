package com.example.carepulse.config;

import com.example.carepulse.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Izinkan semua file statis di root folder static
                .requestMatchers("/", "/index.html", "/*.js", "/*.css", "/static/**", "/css/**", "/js/**").permitAll()
                // Izinkan endpoint login tanpa autentikasi
                .requestMatchers("/api/auth/**").permitAll()
                // Test endpoints (hapus di production!)
                .requestMatchers("/api/test/public").permitAll()
                .requestMatchers("/api/test/**").authenticated()
                // Endpoint API lainnya memerlukan autentikasi
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/dokter/**").hasAnyRole("DOKTER", "ADMIN")
                .requestMatchers("/api/staf-poli/**").hasAnyRole("STAF_POLI", "ADMIN")
                .requestMatchers("/api/pasien/**").hasAnyRole("PASIEN", "DOKTER", "STAF_POLI", "ADMIN")
                // Sementara izinkan semua untuk backward compatibility
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
            )
            // Tambahkan JWT filter sebelum UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
