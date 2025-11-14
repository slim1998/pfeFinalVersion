package com.dto;

import com.entities.Categorie;
import com.entities.Module;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class CategorieDto {

    private long id;
    private String nom;
    private String description;
    private String image;

//    private List<ModuleDto> modules;

    // ----------------- MAPPER -----------------

    public static CategorieDto toDto(Categorie categorie) {
        if (categorie == null) return null;

        return CategorieDto.builder()
                .id(categorie.getId())
                .nom(categorie.getNom())
                .description(categorie.getDescription())
                .image(categorie.getImage())
                .build();
    }

    public static Categorie toEntity(CategorieDto dto) {
        if (dto == null) return null;

        Categorie categorie = new Categorie();
        categorie.setId(dto.getId());
        categorie.setNom(dto.getNom());
         categorie.setDescription(dto.getDescription());
        categorie.setImage(dto.getImage());

        return categorie;
    }
}

