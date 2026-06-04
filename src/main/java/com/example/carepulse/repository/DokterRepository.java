package com.example.carepulse.repository;

import com.example.carepulse.model.Dokter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DokterRepository extends JpaRepository<Dokter, Long> {
    Optional<Dokter> findByEmail(String email);
    boolean existsByEmail(String email);
}
