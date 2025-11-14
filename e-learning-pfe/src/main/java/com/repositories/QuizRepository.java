package com.repositories;

import com.dto.QuizResponseDto;
import com.entities.Quiz;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizRepository  extends JpaRepository<Quiz,Long> {

    Optional<Quiz> findByModuleId(Long moduleId);
    Optional<Quiz> findByChapitreId(Long chapitreId);
    boolean existsByModuleIdAndTitleIgnoreCase(Long moduleId, String title);

}
