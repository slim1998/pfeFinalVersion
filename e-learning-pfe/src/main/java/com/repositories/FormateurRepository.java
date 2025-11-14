package com.repositories;

import com.entities.Apprenant;
import com.entities.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FormateurRepository extends JpaRepository<Formateur, Long>
{
    Optional<Formateur> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT d.apprenant FROM DemandeAchatFormation d " +
            "WHERE d.module.formateur.id = :formateurId " +
            "AND d.statut = 'ACCEPTEE'")
    List<Apprenant> findApprenantsByFormateur(Long formateurId);
}
