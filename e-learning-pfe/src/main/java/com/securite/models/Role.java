package com.securite.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "role")

public class Role {
	@Id
	   @GeneratedValue
	   private Integer id;
	   @Column(unique = true)
	   private String name;

}
