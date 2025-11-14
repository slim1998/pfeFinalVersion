package com.dto;

import com.entities.Formateur;
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
public class FormateurDto {

    private Long id;
    private String firstName;      // correspond à firstName
    private String lastName;   // correspond à lastName
    private String username;
    private String email;
    private String adress;
    private String phone;
    private String grade;
    private String photo;
    private String password;


    // Conversion Entity → DTO
    public static FormateurDto toDto(Formateur formateur) {
        if (formateur == null) return null;

        return FormateurDto.builder()
                .id(formateur.getId())
                .lastName(formateur.getFirstName())   // firstName → nom
                .firstName(formateur.getLastName()) // lastName → prenom
                .username(formateur.getUsername())
                .password(formateur.getPassword())
                .email(formateur.getEmail())
                .adress(formateur.getAdress())
                .phone(formateur.getPhone())
                .grade(formateur.getGrade())
                .photo(formateur.getPhoto())
                .build();
    }

    // Conversion DTO → Entity
    public static Formateur toEntity(FormateurDto dto) {
        if (dto == null) return null;

        Formateur formateur = new Formateur();
        formateur.setId(dto.getId());
        formateur.setFirstName(dto.getFirstName());    // nom → firstName
        formateur.setLastName(dto.getLastName());  // prenom → lastName
        formateur.setUsername(dto.getUsername());
        formateur.setPassword(dto.getPassword());
        formateur.setEmail(dto.getEmail());
        formateur.setAdress(dto.getAdress());
        formateur.setPhone(dto.getPhone());
        formateur.setGrade(dto.getGrade());
        formateur.setPhoto(dto.getPhoto());

        return formateur;
    }
}
