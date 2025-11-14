package com.Services.Impl;

import com.Services.QuizService;
import com.dto.*;
import com.entities.*;
import com.entities.Module;
import com.exeptions.BadRequestException;


import com.exeptions.LessonNotFoundException;
import com.exeptions.NotFoundException;
import com.exeptions.QuizNotFoundException;
import com.repositories.ChapitreRepository;
import com.repositories.ModuleRepository;
import com.repositories.QuizRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final ModuleRepository moduleRepository;
    private final ChapitreRepository chapitreRepository;

    @Override
    @Transactional
    public QuizResponseDto create(Long moduleId, QuizDto dto) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow();

        if (quizRepository.existsByModuleIdAndTitleIgnoreCase(moduleId, dto.getTitle())) {
            throw new BadRequestException("Un quiz avec ce titre existe déjà pour cette formation");
        }

        validate(dto);

        Quiz quiz = dto.toEntity();
        quiz.setModule(module);

        Quiz saved = quizRepository.save(quiz);
        return QuizResponseDto.fromEntity(saved);
    }

    @Override
    public QuizResponseDto getById(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();

        return QuizResponseDto.fromEntity(quiz);
    }
//

    @Override
    @Transactional
    public QuizResponseDto update(Long quizId, QuizDto dto) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();

        validate(dto);

        // Mise à jour simple : on remplace tout (questions + options)
        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        quiz.getQuestions().clear();

        if (dto.getQuestions() != null) {
            for (QuestionDto qd : dto.getQuestions()) {
                Question q = Question.builder()
                        .text(qd.getText())
                        .points(qd.getPoints() == null ? 1 : qd.getPoints())
                        .build();
                quiz.addQuestion(q);

                if (qd.getAnswerOptions() != null) {
                    for (AnswerOptionDto od : qd.getAnswerOptions()) {
                        AnswerOption op = AnswerOption.builder()
                                .text(od.getText())
                                .correct(od.isCorrect())
                                .build();
                        q.addOption(op);
                    }
                }
            }
        }

        Quiz saved = quizRepository.save(quiz);
        return QuizResponseDto.fromEntity(saved);
    }

    @Override
    public void delete(Long quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new NotFoundException("Quiz introuvable: id=" + quizId);
        }
        quizRepository.deleteById(quizId);
    }

    private void validate(QuizDto dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank())
            throw new BadRequestException("Le titre du quiz est obligatoire");

        if (dto.getQuestions() == null || dto.getQuestions().isEmpty())
            throw new BadRequestException("Le quiz doit contenir au moins une question");

        int idx = 1;
        for (QuestionDto q : dto.getQuestions()) {
            if (q.getText() == null || q.getText().isBlank())
                throw new BadRequestException("Question #" + idx + ": le texte est obligatoire");

            // Log pour diagnostiquer le problème
            if (q.getAnswerOptions() == null) {
                throw new BadRequestException("Question #" + idx + ": les options sont nulles");
            }

            if (q.getAnswerOptions().isEmpty()) {
                throw new BadRequestException("Question #" + idx + ": aucune option fournie");
            }

            if (q.getAnswerOptions().size() < 2) {
                throw new BadRequestException("Question #" + idx + ": au moins 2 options requises (trouvé: " + q.getAnswerOptions().size() + ")");
            }

            long correctCount = q.getAnswerOptions().stream().filter(AnswerOptionDto::isCorrect).count();
            if (correctCount != 1)
                throw new BadRequestException("Question #" + idx + ": exactement 1 option correcte est requise (trouvé: " + correctCount + ")");

            idx++;
        }
    }



    @Override
    public QuizResponseDto createQuizForChapitre(Long chapitreId, QuizDto quizDto) {
        Chapitre chapitre = chapitreRepository.findById(chapitreId)
                .orElseThrow(() -> new RuntimeException("Chapitre introuvable"));

        Quiz quiz = quizDto.toEntity();
        quiz.setChapitre(chapitre);
        quiz.setModule(null); // Laisser null pour les quiz de chapitre

        Quiz saved = quizRepository.save(quiz);
        return QuizResponseDto.fromEntity(saved);
    }

    @Override
    public QuizResponseDto createFinalQuizForModule(Long moduleId, QuizDto quizDto) {
        if (moduleId == null) {
            throw new IllegalArgumentException("ModuleId ne peut pas être null");
        }
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module introuvable"));

        // Conversion DTO → Entity
        Quiz quiz = quizDto.toEntity();
        quiz.setModule(module);
        quiz.setChapitre(null); // NE PAS mettre de chapitre


        Quiz saved = quizRepository.save(quiz);

        return QuizResponseDto.fromEntity(saved);
    }

    @Override
    public QuizResponseDto getQuizByModuleId(Long moduleId) {
        return quizRepository.findByModuleId(moduleId)
                .map(QuizResponseDto::fromEntity)
                .orElse(null); // ou throw exception si tu veux
    }
@Override
    public QuizResponseDto getQuizByChapitreId(Long chapitreId) {
        return quizRepository.findByChapitreId(chapitreId)
                .map(QuizResponseDto::fromEntity)
                .orElse(null);
    }

    public boolean existsQuizByModuleIdAndTitle(Long moduleId, String title) {
        return quizRepository.existsByModuleIdAndTitleIgnoreCase(moduleId, title);
    }

    @Override
    @Transactional
    public void deleteQuizForChapitre(Long chapitreId, Long quizId) {
        Chapitre chapitre = chapitreRepository.findById(chapitreId)
                .orElseThrow(() -> new RuntimeException("Chapitre introuvable: " + chapitreId));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz introuvable: " + quizId));

        if (quiz.getChapitre() == null || !quiz.getChapitre().getId().equals(chapitreId)) {
            throw new RuntimeException("Ce quiz n'appartient pas au chapitre id: " + chapitreId);
        }

        // ⚡ casser la relation avant delete pour éviter les résidus dans le cache Hibernate
        chapitre.setQuiz(null);
        chapitreRepository.save(chapitre);

        quizRepository.delete(quiz);
    }


}
