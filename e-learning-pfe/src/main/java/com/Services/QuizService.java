package com.Services;

import com.Services.Impl.QuizServiceImpl;
import com.dto.QuizDto;
import com.dto.QuizResponseDto;
import com.entities.Quiz;
import com.exeptions.QuizNotFoundException;

import java.util.List;

public interface QuizService {



    QuizResponseDto create(Long moduleId, QuizDto dto);
    QuizResponseDto getById(Long quizId) throws QuizNotFoundException;

    QuizResponseDto update(Long quizId, QuizDto dto);
    void delete(Long quizId);

    QuizResponseDto createQuizForChapitre(Long chapitreId, QuizDto quizDto);
     QuizResponseDto createFinalQuizForModule(Long moduleId, QuizDto quizDto);


    void deleteQuizForChapitre(Long chapitreId, Long quizId);

    QuizResponseDto getQuizByModuleId(Long moduleId)  throws QuizNotFoundException;

    QuizResponseDto getQuizByChapitreId(Long chapitreId) throws QuizNotFoundException ;

}
