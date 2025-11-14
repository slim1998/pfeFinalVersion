package com.dto;

import com.securite.models.Administrateur;
import com.securite.models.RegisterRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class AdministrateurDto extends RegisterRequest {
	private String isadmim;

	public static Administrateur toEntity(AdministrateurDto request) {
		return Administrateur.builder()

				.firstName(request.getFirstName())
				.lastName(request.getLastName())
				.email(request.getEmail())
				.password(request.getPassword())
				.adress(request.getAdress()).phone(request.getPhone())
				.isadmim(request.getIsadmim())
				.build();

	}

	public static AdministrateurDto toDto(Administrateur request) {
		return AdministrateurDto.builder()
				.id(request.getId())
				.firstName(request.getFirstName())
				.lastName(request.getLastName())
				.email(request.getEmail())
				.password(request.getPassword())
				.phone(request.getPhone())
				.isadmim(request.getIsadmim())
				.build();

	}

}
