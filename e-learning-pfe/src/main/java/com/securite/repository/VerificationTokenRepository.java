package com.securite.repository;

import com.securite.models.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;






public interface VerificationTokenRepository extends JpaRepository<VerificationToken,Long> {
    VerificationToken findByToken(String token);
}

