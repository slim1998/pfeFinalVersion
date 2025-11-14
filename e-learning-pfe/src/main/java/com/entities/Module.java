package com.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.SuperBuilder;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

@Entity
@Table(name = "module")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder




public class Module {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    private String titre;
    private String short_description;
    private String long_description;
    private boolean canAccess;




    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime lectureTime;
    private String image;
    private String video;
     private Double prixFinal;

//    private String formateur;
    private double prixInitial;
    @Column(nullable = false)
    private int discount;
    @Enumerated(EnumType.STRING)
    private Level level;



    @ManyToOne
  @JoinColumn(name = "formateur_id")
    private Formateur formateur;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Chapitre> chapitres;






    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
    private List<Review> reviews;

    @OneToMany
    private List<DemandeAchatFormation> demandeAchatFormations;

    @OneToOne(mappedBy = "module",cascade = CascadeType.ALL)
    private Quiz finalExam;


    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certification> certifications;


}

















//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String titre;
//    private String short_description;
//    private String long_description;
//    private Level level;
//    private String image;
//    private String video;
//
//    private double prixInitial;
//    private int discount;
//
//    @ManyToOne
//    @JoinColumn(name = "formateur_id")
//    private Formateur formateur;
//
//    @ManyToOne (cascade = CascadeType.ALL)
//    private Categorie categorie;
//
//    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
//    private List<Chapitre> chapitres;

