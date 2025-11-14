package com.repositories;

import com.entities.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification, Long> {

    // récupérer toutes les certifications par module
    List<Certification> findByModule_Id(Long moduleId);

    // récupérer toutes les certifications par apprenant
    List<Certification> findByApprenant_Id(Long apprenantId);

    // vérifier si une certification existe déjà pour un apprenant et un module
    boolean existsByApprenant_IdAndModule_Id(Long apprenantId, Long moduleId);

    // récupérer une certification spécifique (apprenant + module)
    List<Certification> findByApprenant_IdAndModule_Id(Long apprenantId, Long moduleId);

    @Query("SELECT c FROM Certification c WHERE c.module.formateur.id = :formateurId")
    List<Certification> findByFormateurId(@Param("formateurId") Long formateurId);

}
