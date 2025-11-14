package com.repositories;

import com.entities.DemandeAchatFormation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.entities.Module; // ✅ important


import java.util.List;

public interface DemandeAchatRepository extends JpaRepository <DemandeAchatFormation, Long>{


        @Query("SELECT d.module FROM DemandeAchatFormation d " +
                "WHERE d.apprenant.id = :apprenantId " +
                "AND d.statut = com.entities.DemandeAchatFormation.StatutDemande.ACCEPTEE")
        List<Module> findAcceptedModulesByApprenantId(@Param("apprenantId") Long apprenantId);



    boolean existsByApprenantIdAndModuleIdAndStatut(Long apprenantId, Long moduleId, DemandeAchatFormation.StatutDemande statut);

}



