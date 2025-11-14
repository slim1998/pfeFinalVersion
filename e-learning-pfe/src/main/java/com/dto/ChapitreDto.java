

package com.dto;
import com.dto.LessonDto;
import com.entities.Chapitre;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChapitreDto {
    private Long id;
    private String titre;
    private List<LessonDto> lessons;
    private Long moduleId;
    private int ordre;

    public static ChapitreDto toDto(Chapitre chapitre) {
        if (chapitre == null) {
            return null;
        }

        ChapitreDto dto = new ChapitreDto();
        dto.setId(chapitre.getId());
        dto.setTitre(chapitre.getTitre());
        dto.setOrdre(chapitre.getOrdre());

        // ✅ Récupérer le moduleId
        if (chapitre.getModule() != null) {
            dto.setModuleId(chapitre.getModule().getId());
        }

        // ✅ Convertir les lessons
        if (chapitre.getLessons() != null && !chapitre.getLessons().isEmpty()) {
            dto.setLessons(
                    chapitre.getLessons()
                            .stream()
                            .map(LessonDto::toDto)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    public static Chapitre toEntity(ChapitreDto dto) {
        if (dto == null) {
            return null;
        }

        Chapitre chapitre = new Chapitre();
        chapitre.setId(dto.getId());
        chapitre.setTitre(dto.getTitre());
        chapitre.setOrdre(dto.getOrdre());

        // Note: Le module doit être associé dans le service
        // car on ne peut pas créer un Module ici sans le ModuleRepository

        return chapitre;
    }
}
