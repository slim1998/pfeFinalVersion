package com.securite.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CentreFormation {
	@Id
	@GeneratedValue
	private Integer id;
	private String nameCentreFrmation;
	private String codeCentreFrmation;
	
	@OneToMany
	private List<Administrateur> agentadministratifs;

}
