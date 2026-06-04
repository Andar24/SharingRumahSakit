package com.example.carepulse.service;

import com.example.carepulse.dto.LoginRequest;
import com.example.carepulse.dto.LoginResponse;
import com.example.carepulse.model.User;
import com.example.carepulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponse prosesLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email tidak terdaftar di sistem."));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Kata sandi yang Anda masukkan salah.");
        }

        String dummyToken = "jwt-token-rahasia-" + user.getId();

        return new LoginResponse(
                dummyToken,              
                user.getEmail(),         
                user.getNamaLengkap(),   
                user.getRole(),
                user.getId() // MENGIRIM ID KE FRONTEND
        );
    }
}
