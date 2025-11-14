package com.dto;

import com.entities.Chapitre;
import com.entities.Lesson;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class LessonDto {


    private Long id;
    private String titre;
    private String contenu;
    private int ordre;
    private String description;
    private Long chapitreId;

    private LocalTime duree;



    public static Lesson toEntity(LessonDto dto) {
        if (dto == null) return null;

        Chapitre chapitre = null;
        if (dto.getChapitreId() != null) {
            chapitre = Chapitre.builder()
                    .id(dto.getChapitreId())
                    .build();
        }

        return Lesson.builder()
                .id(dto.getId())
                .titre(dto.getTitre())
                .contenu(dto.getContenu())
                .ordre(dto.getOrdre())
                .description(dto.getDescription())
                .chapitre(chapitre) // ⚡ association
                .duree(dto.getDuree())
                .build();
    }


    public static LessonDto toDto(Lesson lesson) {
        if (lesson == null) {
            return null;
        }

        return LessonDto.builder()
                .id(lesson.getId())
                .titre(lesson.getTitre())
                .contenu(lesson.getContenu())
                .ordre(lesson.getOrdre())
                .chapitreId(lesson.getChapitre() != null ? lesson.getChapitre().getId() : null)
                .description(lesson.getDescription())
                .duree(lesson.getDuree())

                .build();
    }
}
