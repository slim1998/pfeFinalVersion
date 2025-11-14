package com.dto;

import com.entities.Apprenant;
import com.entities.DemandeAchatFormation;
import com.entities.Module;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class DemandeAchatFormationDto {


    private Long id;

    private Long apprenantId;
    private String apprenantNom;
    private String apprenantEmail;
    private String phone;
    private String adress;
    private Double prixFinal;

    private Long moduleId;
    private String moduleTitre;

    private LocalDate dateDemande;
    private String statut;
    private double prixInitial;




    public static DemandeAchatFormationDto toDto(DemandeAchatFormation entity) {
        if (entity == null) return null;

        return DemandeAchatFormationDto.builder()
                .id(entity.getId())
                .apprenantId(entity.getApprenant() != null ? entity.getApprenant().getId() : null)
                .apprenantNom(entity.getApprenant() != null ? entity.getApprenant().getUsername() : null)
                .moduleId(entity.getModule() != null ? entity.getModule().getId() : null)
                .moduleTitre(entity.getModule() != null ? entity.getModule().getTitre() : null)
                .dateDemande(entity.getDateDemande())
                .statut(entity.getStatut() != null ? entity.getStatut().name() : null)
                .apprenantEmail(entity.getApprenant() != null ? entity.getApprenant().getEmail() : null)
                .phone(entity.getApprenant() != null ? entity.getApprenant().getPhone() : null)
                .adress(entity.getApprenant() != null ? entity.getApprenant().getAdress() : null)
                .prixFinal(entity.getModule() != null ? entity.getModule().getPrixFinal() : null)
                .build();
    }

    public static DemandeAchatFormation toEntity(DemandeAchatFormationDto dto) {
        if (dto == null) return null;

        DemandeAchatFormation entity = new DemandeAchatFormation();
        entity.setId(dto.getId());

        // Fix module
        if (dto.getModuleId() != null) {
            Module module = Module.builder()
                    .id(dto.getModuleId())
                    .build();
            entity.setModule(module);
        }

        // Fix apprenant
        if (dto.getApprenantId() != null) {
            Apprenant apprenant = Apprenant.builder()
                    .id(dto.getApprenantId())
                    .build();
            entity.setApprenant(apprenant);
        }

        entity.setDateDemande(dto.getDateDemande());

        if (dto.getStatut() != null) {
            entity.setStatut(DemandeAchatFormation.StatutDemande.valueOf(dto.getStatut()));
        }



        return entity;
    }

}
