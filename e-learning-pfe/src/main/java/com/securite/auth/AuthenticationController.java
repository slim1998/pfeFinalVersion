package com.securite.auth;


import com.dto.AdministrateurDto;
import com.dto.ApprenantDto;
import com.securite.config.LogoutService;
import com.securite.models.AuthenticationRequest;
import com.securite.models.AuthenticationResponse;
import com.securite.models.RegisterRequest;
import com.securite.models.Response;
import com.securite.service.AdministrateurService;
import com.securite.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
  private final AuthenticationService service;
  private final UserService userService;
  private final LogoutService logoutService;


  @PostMapping("/register")
  public ResponseEntity<Response> register(@RequestBody @Valid AdministrateurDto userRequest, HttpServletRequest request) {
    return service.register(userRequest, request);
  }



  @PostMapping("/registerApprenant")
  public ResponseEntity<Response> registerapprenant(
          @RequestBody @Valid ApprenantDto userRequest,
          HttpServletRequest request
  )  {
    return service.register(userRequest,request);
  }






  @PostMapping("/authenticate")
  public ResponseEntity<AuthenticationResponse> authenticate(
      @RequestBody AuthenticationRequest request
  ) {
    return ResponseEntity.ok(service.authenticate(request));
  }
  @PostMapping("/refresh-token")
  public void refreshToken(
      HttpServletRequest request,
      HttpServletResponse response
  ) throws IOException {
    service.refreshToken(request, response);
  }

  @PostMapping("/logout")
  public void logout(
          HttpServletRequest request,
          HttpServletResponse response,
          Authentication authentication
  ) {
    logoutService.logout(request, response, authentication);
  }





}
