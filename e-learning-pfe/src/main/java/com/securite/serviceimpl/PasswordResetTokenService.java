package com.securite.serviceimpl;


import com.securite.models.ActionRsetpW;
import com.securite.models.ChangePasswordResetRequest;
import com.securite.models.Resetpwemail;
import org.springframework.http.ResponseEntity;





public interface PasswordResetTokenService {
	String verifyEmail(Resetpwemail rep);


ResponseEntity<String> verifyOtp(ActionRsetpW actionrsetPW);


   ResponseEntity<String> changePasswordHandler(
           ChangePasswordResetRequest changePasswordResetRequest  );


}

