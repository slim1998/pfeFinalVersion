package com.repositories;

import com.dto.ReviewDto;
import com.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {


        // Vérifier si une review existe
        @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
                "FROM Review r " +
                "WHERE r.module.id = :moduleId " +
                "AND r.apprenant.id = :apprenantId")
        boolean existsByModuleAndApprenant(@Param("moduleId") Long moduleId,
                                           @Param("apprenantId") Long apprenantId);
        @Query("SELECT r FROM Review r WHERE r.module.id = :moduleId")
        List<Review> findReviewsByModuleId(@Param("moduleId") Long moduleId);


}
