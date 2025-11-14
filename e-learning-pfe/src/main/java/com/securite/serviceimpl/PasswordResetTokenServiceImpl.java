package com.securite.serviceimpl;

import com.securite.models.*;
import com.securite.repository.ForgotPasswordTokenRepository;
import com.securite.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class PasswordResetTokenServiceImpl implements PasswordResetTokenService {
    private final UserRepository userRepository;
    private final ForgotPasswordTokenRepository forgotPasswordRepository;

    private final PasswordEncoder passwordEncoder;

    //send mail for email verification
    public ResponseEntity<String> verifyEmail(Response rep){
        User user = userRepository.findByEmail(rep.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Please provide an valid email"));
        //time to formulate the mail body
        int token = otpGenerator();
        EmailDetails mailBody = EmailDetails
                .builder()
                .to(rep.getEmail())
                .subject("OTP for Forgot Password request")
                .messageBody("This is the OTP for your Forgot Password request : " + token)
                .build();
        ForgotPasswordToken fp = ForgotPasswordToken
                .builder()
                .token(token)
                .expirationTime(new Date(System.currentTimeMillis() + 24 * 60 * 1000))
                .user(user)
                .build();


        //Send Mail

        forgotPasswordRepository.save(fp);

        return ResponseEntity.ok("Email sent for verfication successfully");

    }

    public ResponseEntity<String> verifyOtp(ActionRsetpW actionrsetPW){
        User user = userRepository.findByEmail(actionrsetPW.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Please provide an valid email"));
System.err.println(actionrsetPW.getOtp());
        ForgotPasswordToken fp =forgotPasswordRepository.findByTokenAndUser(actionrsetPW.getOtp(),user)
                .orElseThrow(()-> new RuntimeException("Invalid OTP for email"+actionrsetPW.getEmail() ));

        //Check if the expiration time of OTP is not expired
        if (fp.getExpirationTime().before(Date.from(Instant.now()))){
            forgotPasswordRepository.deleteById(fp.getId());
            return new ResponseEntity<>("OTP has expired", HttpStatus.EXPECTATION_FAILED);
        }

        return ResponseEntity.ok("OTP verified ");

    }


    //Now User Can change the password

    public ResponseEntity<String> changePasswordHandler(
            ChangePasswordResetRequest changePassword,
            String email
    ){
        boolean areEqual = (changePassword.getNewPassword()).equals(changePassword.getConfirmationPassword());
        if (!areEqual){
            return new ResponseEntity<>("Please enter the password again!",HttpStatus.EXPECTATION_FAILED);
        }
        System.err.println(changePassword.getConfirmationPassword());
        //We need to encode password
        String encodedPassword = passwordEncoder.encode(changePassword.getNewPassword());
        userRepository.updatePassword(email,encodedPassword);
        return ResponseEntity.ok("Password has been succesfully changed!");

    }


    private Integer otpGenerator(){
        Random random = new Random();
        return random.nextInt(100_000,999_999);//Minimum && Maximum
    }

	@Override
	public String verifyEmail(Resetpwemail rep) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ResponseEntity<String> changePasswordHandler(ChangePasswordResetRequest changePasswordResetRequest) {
		// TODO Auto-generated method stub
		return null;
	}
}

