package com.securite.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	private String password;
	private String adress;
	private String phone;
	private String confirmPassword;


	private Set<String> roles;

}
