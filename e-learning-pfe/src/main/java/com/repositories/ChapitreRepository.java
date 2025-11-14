package com.repositories;

import com.entities.Chapitre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChapitreRepository  extends JpaRepository<Chapitre, Long> {
    // ✅ Méthode pour récupérer les chapitres par module
    List<Chapitre> findByModuleId(Long moduleId);

    // ✅ Méthode pour compter les chapitres d'un module
    Long countByModuleId(Long moduleId);

}
