package com.repositories;
import com.entities.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByFormateurId(Long formateurId);
    List<Module> findByCategorieId(Long categorieId);


    @Query("SELECT COUNT(f) FROM Module f WHERE f.formateur.id = :formateurId")
    Long countByFormateurId(@Param("formateurId") Long formateurId);

}
