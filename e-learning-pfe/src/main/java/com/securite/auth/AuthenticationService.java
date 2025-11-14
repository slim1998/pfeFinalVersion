package com.securite.auth;



import com.dto.AdministrateurDto;
import com.dto.ApprenantDto;
import com.entities.Apprenant;
import com.repositories.ApprenantRepository;
import com.securite.config.JwtService;
import com.securite.lisner.RegistrationCompleteEvent;
import com.securite.models.*;
import com.securite.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.securite.repository.RoleRepository;
import com.securite.repository.TokenRepository;
import com.securite.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.securite.service.UserService.applicationUrl;


@Service
@RequiredArgsConstructor
public class AuthenticationService {
	private final UserRepository repository;
	private final TokenRepository tokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;
	private final ApplicationEventPublisher publisher;
	private final RoleRepository roleRepository;
	private final AdministrateurRepository administrateurRepository;
	private final ApprenantRepository apprenantRepository;


	// register
	public ResponseEntity<Response> register(RegisterRequest userRequest, final HttpServletRequest request) {
		// System.err.println(userRequest.getRole());
		boolean userExists = repository.findAll()
				.stream()
				.anyMatch(user -> userRequest.getEmail().equalsIgnoreCase(user.getEmail()));
		if (userExists) {
			return ResponseEntity.badRequest().body(Response.builder()
					.responseMessage("User with provided email  already exists!")
					.build());
		}
		if (userRequest instanceof ApprenantDto) {
			Apprenant apprenant = ApprenantDto.toEntity((ApprenantDto) userRequest);
			apprenant.setPassword(passwordEncoder.encode(userRequest.getPassword()));
			apprenant.setRole(Erole.APPRENANT);
			apprenant.setEnabled(true);
			var savedUser = repository.save(apprenant);
			publisher.publishEvent(new RegistrationCompleteEvent(savedUser, applicationUrl(request)));
			return new ResponseEntity<>(
					Response.builder()
							.responseMessage("Success! Please, check your email to complete your registration")
							.email(savedUser.getEmail())
							.id(savedUser.getId())
							.build(),
					HttpStatus.CREATED
			);
		} else if (userRequest instanceof AdministrateurDto) {
			Administrateur user = AdministrateurDto.toEntity((AdministrateurDto) userRequest);
			user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
			user.setRole(Erole.ADMINISTRATEUR);
			user.setEnabled(true);
			var savedUser = repository.save(user);
			publisher.publishEvent(new RegistrationCompleteEvent(savedUser, applicationUrl(request)));
			return new ResponseEntity<>(
					Response.builder()
							.responseMessage("Success! Please, check your email to complete your registration")
							.email(savedUser.getEmail())
							.build(),
					HttpStatus.CREATED
			);
		}
        return null;
    }


	public AuthenticationResponse authenticate(AuthenticationRequest request) {
		authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
		var user = repository.findByEmail(request.getEmail()).orElseThrow();
		var claims = new HashMap<String, Object>();
		claims.put("fullname", user.getFirstName() + " " + user.getLastName());
		claims.put("userId", user.getId());
		var jwtToken = jwtService.generateToken(claims, user);
		// var jwtToken = jwtService.generateToken(user);

		var refreshToken = jwtService.generateRefreshToken(user);
		revokeAllUserTokens(user);
		saveUserToken(user, jwtToken);
		return AuthenticationResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
	}

	private void saveUserToken(User user, String jwtToken) {
		var token = Token.builder().user(user).token(jwtToken).tokenType(TokenType.BEARER).expired(false).revoked(false)
				.build();
		tokenRepository.save(token);
	}

	private void revokeAllUserTokens(User user) {
		var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
		if (validUserTokens.isEmpty())
			return;
		validUserTokens.forEach(token -> {
			token.setExpired(true);
			token.setRevoked(true);
		});
		tokenRepository.saveAll(validUserTokens);
	}

	public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
		final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
		final String refreshToken;
		final String userEmail;
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			return;
		}
		refreshToken = authHeader.substring(7);
		userEmail = jwtService.extractUsername(refreshToken);
		if (userEmail != null) {
			var user = this.repository.findByEmail(userEmail).orElseThrow();
			if (jwtService.isTokenValid(refreshToken, user)) {
				var accessToken = jwtService.generateToken(user);
				revokeAllUserTokens(user);
				saveUserToken(user, accessToken);
				var authResponse = AuthenticationResponse.builder().accessToken(accessToken).refreshToken(refreshToken)
						.build();
				new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
			}
		}
	}
//affecter au centre if existe


	@PostConstruct
	public void createDefaultAdmin() {

		if (roleRepository.findByName("AdminSystem").isEmpty()) {
			roleRepository.save(Role.builder().name("AdminSystem").build());
		}
		if (roleRepository.findByName("administrateur").isEmpty()) {
			roleRepository.save(Role.builder().name("administrateur").build());
		}
		if (roleRepository.findByName("formateur").isEmpty()) {
			roleRepository.save(Role.builder().name("formateur").build());
		}
		if (roleRepository.findByName("apprenant").isEmpty()) {
			roleRepository.save(Role.builder().name("apprenant").build());
		}


		User user = new Administrateur();
		String email = "<div class=\"modal\" tabindex=\"-1\">\r\n" + "  <div class=\"modal-dialog\">\r\n"
				+ "    <div class=\"modal-content\">\r\n" + "      <div class=\"modal-header\">\r\n"
				+ "        <h5 class=\"modal-title\">Modal title</h5>\r\n"
				+ "        <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\" aria-label=\"Close\"></button>\r\n"
				+ "      </div>\r\n" + "      <div class=\"modal-body\">\r\n"
				+ "        <p>Modal body text goes here.</p>\r\n" + "      </div>\r\n"
				+ "      <div class=\"modal-footer\">\r\n"
				+ "        <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">Close</button>\r\n"
				+ "        <button type=\"button\" class=\"btn btn-primary\">Save changes</button>\r\n"
				+ "      </div>\r\n" + "    </div>\r\n" + "  </div>\r\n" + "</div>";

		String emailadm = "admin@mail.com";
		if (!repository.existsByEmail(emailadm)) {
			user.setEmail("admin@mail.com");
			user.setFirstName("Bouchiba");
			user.setLastName("Slim");
			user.setEnabled(true);
			user.setPassword(passwordEncoder.encode("admine"));
			List<Role> roles = new ArrayList<>();
			Role userRole = roleRepository.findByName("AdminSystem")
					.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
			roles.add(userRole);
			user.setRole(Erole.ADMINISTRATEUR);

			repository.save(user);
		}

	}

}
