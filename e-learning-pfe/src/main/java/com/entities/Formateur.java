package com.entities;
import com.securite.models.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Entity
@DiscriminatorValue("FORMATEUR")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@SuperBuilder
public class Formateur extends User {
    
    private String username;
    private String photo;
    private String grade;

}
