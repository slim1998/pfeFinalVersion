package com.dto;

import com.entities.Apprenant;
import com.entities.Formateur;
import com.entities.Review;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class ReviewDto {
    private Long id;
    private String commentaire;
    private int rating;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime date;
    private Long apprenantId;
    private String apprenantName;


// lknslkanslk paosopa poaisp
    private Long moduleId;
    private String moduleName;
    private String moduleImage;


    private boolean visible = true;


    public static ReviewDto toDto(Review review) {
        String firstImage = null;

        if (review.getModule() != null
                && review.getModule().getImage() != null
                && !review.getModule().getImage().isEmpty()) {
            firstImage = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/v1/module/downloadmoduleimage/")
                    .path(review.getModule().getImage())
                    .toUriString();
        }

        return ReviewDto.builder()
                .id(review.getId())
                .commentaire(review.getCommentaire())
                .rating(review.getRating())
                .date(review.getDate())
                .visible(review.isVisible())

                .apprenantId(review.getApprenant() != null ? review.getApprenant().getId() : null)
                .apprenantName(review.getApprenant() != null
                        ? review.getApprenant().getFirstName() + " " + review.getApprenant().getLastName()
                        : null)

                .moduleId(review.getModule() != null ? review.getModule().getId() : null)
                .moduleName(review.getModule() != null ? review.getModule().getTitre(): null)
                .moduleImage(firstImage)
                .build();
    }



    public static Review toEntity(ReviewDto dto) {
        if (dto == null) return null;

        Review review = new Review();
        review.setId(dto.getId());
        review.setCommentaire(dto.getCommentaire());
        review.setRating(dto.getRating());
        review.setDate(dto.getDate());
        review.setVisible(dto.isVisible());

        // Lier Apprenant si l'ID est présent
        if (dto.getApprenantId() != null) {
            Apprenant apprenant = new Apprenant();
            apprenant.setId(dto.getApprenantId());
            review.setApprenant(apprenant);
        }

        // Lier Module si l'ID est présent
        if (dto.getModuleId() != null) {
            com.entities.Module module = new com.entities.Module();
            module.setId(dto.getModuleId());
            review.setModule(module);
        }

        // Lier Formateur si l'ID est présent

        return review;
    }
}
