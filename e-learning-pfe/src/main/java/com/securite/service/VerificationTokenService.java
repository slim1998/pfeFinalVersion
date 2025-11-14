package com.securite.service;

import com.securite.models.Response;
import com.securite.models.User;
import com.securite.models.VerificationToken;
import org.springframework.http.ResponseEntity;

;




public interface VerificationTokenService {
	
   void saveUserVerificationToken(User user, String token);
   String validateToken(String token);
   ResponseEntity<Response> verifyEmail(String token);
   VerificationToken generateNewVerificationToken(String oldToken);
}
