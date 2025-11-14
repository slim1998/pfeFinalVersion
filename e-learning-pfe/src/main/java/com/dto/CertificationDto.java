package com.dto;

import com.entities.Certification;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class CertificationDto {

    private Long id;
    private String titre;

    private Instant dateObtention;

    private  Long apprenantId  ;
    private Double score;
    private Long moduleId;
    private Long quizId;

    public static CertificationDto toDto(Certification certification) {
        if (certification == null) return null;

        return CertificationDto.builder()
                .id(certification.getId())
                .titre(certification.getTitre())
                .dateObtention(certification.getDateObtention())
                .apprenantId(certification.getApprenant().getId()) // ⚠️ attention au nom de la méthode
                .score(certification.getScore())
                .moduleId(certification.getModule() != null ? certification.getModule().getId() : null)
                .quizId(certification.getQuiz() != null ? certification.getQuiz().getId() : null)
                .build();
    }

    public static Certification toEntity(CertificationDto dto) {
        if (dto == null) return null;

        Certification certification = new Certification();
        certification.setId(dto.getId());
        certification.setTitre(dto.getTitre());
        certification.setDateObtention(dto.getDateObtention());
        certification.setScore(dto.getScore());

        // ⚠️ module et quiz doivent être set dans le service (fetch depuis DB)
        return certification;
    }
}
