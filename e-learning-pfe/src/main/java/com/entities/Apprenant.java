package com.entities;


import com.securite.models.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@DiscriminatorValue("APPRENANT")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@SuperBuilder
public class Apprenant extends User {

    private String niveau;
    private String photo;


    @OneToMany
    private List<DemandeAchatFormation> demandeAchatFormations;
}

