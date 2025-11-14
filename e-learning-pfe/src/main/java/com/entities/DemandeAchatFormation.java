package com.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
@Entity
@Table(name = "demande_achat_formation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DemandeAchatFormation {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double prixInitial;

    // L'utilisateur qui fait la demande
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apprenant_id")
    private Apprenant apprenant;

    // La formation demandée
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    // Date de la demande
    @Column(name = "date_demande")
    private LocalDate dateDemande;

    // Statut de la demande : EN_ATTENTE, ACCEPTEE, REFUSEE
    @Enumerated(EnumType.STRING)
    private StatutDemande statut = StatutDemande.EN_ATTENTE ;


    // Enum pour le statut
    public enum StatutDemande {
        EN_ATTENTE,
        ACCEPTEE,
        REFUSEE
    }
}
