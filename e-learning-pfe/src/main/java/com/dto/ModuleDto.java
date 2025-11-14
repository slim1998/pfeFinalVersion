// SOLUTION 1: Modifier le DTO pour faire la conversion String -> Enum
package com.dto;

import com.entities.*;
import com.entities.Module;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class ModuleDto {
    private Long id;
    private String titre;
    private String short_description;
    private String long_description;
    private String level; // Reste String pour recevoir depuis Angular
    private LocalTime lectureTime;
    private String image;
    private String video;
    private double prixInitial;
    private Integer discount;
    private Long categorieId;
    private Long formateurId;
    private String formateurName;
    private String formateurPhoto;
    private Double prixFinal;
    private boolean canAccess;


    private List<ChapitreDto> chapitres;
    private List<ReviewDto> reviews;


    // ✅ FIX: Conversion String -> Enum Level dans toEntity()
    public static Module toEntity(ModuleDto moduleDto) {
        Module module = Module.builder()
                .titre(moduleDto.getTitre())
                .short_description(moduleDto.getShort_description())
                .long_description(moduleDto.getLong_description())
                .level(convertStringToLevel(moduleDto.getLevel())) // ✅ CONVERSION ICI
                .lectureTime(moduleDto.getLectureTime())
                .image(moduleDto.getImage())
                .canAccess(moduleDto.isCanAccess())

                .video(moduleDto.getVideo())
                .prixInitial(moduleDto.getPrixInitial())
                .discount(moduleDto.getDiscount() != null ? moduleDto.getDiscount() : 0)
                .prixFinal(moduleDto.getPrixFinal())
                .build();

        if (moduleDto.getChapitres() != null) {
            module.setChapitres(moduleDto.getChapitres().stream()
                    .map(ChapitreDto::toEntity)
                    .collect(Collectors.toList()));
            module.getChapitres().forEach(c -> c.setModule(module));
        }



        if (moduleDto.getFormateurId() != null) {
            Formateur formateur = new Formateur();
            formateur.setId(moduleDto.getFormateurId());
            module.setFormateur(formateur);
        }

        if (moduleDto.getCategorieId() != null) {
            Categorie categorie = new Categorie();
            categorie.setId(moduleDto.getCategorieId());
            module.setCategorie(categorie);
        }

        return module;
    }

    // ✅ FIX: Conversion Enum -> String dans toDto()
    public static ModuleDto toDto(Module module) {
        return ModuleDto.builder()
                .id(module.getId())
                .titre(module.getTitre())
                .short_description(module.getShort_description())
                .long_description(module.getLong_description())
                .level(convertLevelToString(module.getLevel())) // ✅ CONVERSION ICI
                .lectureTime(module.getLectureTime())
                .image(module.getImage())
                .canAccess(module.isCanAccess())

                .video(module.getVideo())
                .prixInitial(module.getPrixInitial())
                .discount(module.getDiscount())
                .categorieId(module.getCategorie() != null ? module.getCategorie().getId() : null)
                .formateurId(module.getFormateur() != null ? module.getFormateur().getId() : null)
                .formateurName(module.getFormateur().getUsername())
                    .formateurPhoto(module.getFormateur().getPhoto())
                .prixFinal(module.getPrixFinal())
                .chapitres(module.getChapitres() != null
                        ? module.getChapitres().stream().map(ChapitreDto::toDto).toList()
                        : null)


                .reviews(module.getReviews() != null
                        ? module.getReviews().stream()
                        .map(ReviewDto::toDto)
                        .collect(Collectors.toList())
                        : null)
                .build();
    }

    // ✅ NOUVELLE MÉTHODE: Conversion String -> Level Enum
    public static Level convertStringToLevel(String levelString) {
        if (levelString == null || levelString.trim().isEmpty()) {
            return Level.BEGINNER; // Valeur par défaut
        }

        try {
            return Level.valueOf(levelString.toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid level value: " + levelString + ". Using BEGINNER as default.");
            return Level.BEGINNER;
        }
    }

    // ✅ NOUVELLE MÉTHODE: Conversion Level Enum -> String
    private static String convertLevelToString(Level level) {
        if (level == null) {
            return Level.BEGINNER.name();
        }
        return level.name();
    }
}