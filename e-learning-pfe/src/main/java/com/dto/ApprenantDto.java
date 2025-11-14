package com.dto;

import com.entities.Apprenant;
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
public class ApprenantDto extends RegisterRequest {



    private String niveau;
    private String photo;
    private boolean enabled;



    public static ApprenantDto toDto(Apprenant apprenant) {
        if (apprenant == null) return null;

        return ApprenantDto.builder()
                .id(apprenant.getId())
                .firstName(apprenant.getFirstName())
                .lastName(apprenant.getLastName())
                .email(apprenant.getEmail())
                .password(apprenant.getPassword())
                .adress(apprenant.getAdress())
                .phone(apprenant.getPhone())
                .enabled(apprenant.isEnabled())
                .niveau(apprenant.getNiveau())
                .photo(apprenant.getPhoto())

                .build();
    }



    public static Apprenant toEntity(ApprenantDto dto) {
        if (dto == null) return null;

        return Apprenant.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .adress(dto.getAdress())
                .phone(dto.getPhone())
                .enabled(dto.isEnabled())
                .niveau(dto.getNiveau())
                .photo(dto.getPhoto())

                .build();
    }
}
