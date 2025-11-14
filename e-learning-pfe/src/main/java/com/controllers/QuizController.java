package com.controllers;


import com.Services.QuizService;
import com.dto.QuizDto;
import com.dto.QuizResponseDto;
import com.entities.Quiz;
import com.exeptions.BadRequestException;
import com.exeptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@Slf4j
public class QuizController {


    private final QuizService quizService;

    /**
     * Créer un nouveau quiz pour une formation
     */
    @PostMapping("/{moduleId}/addquiz")
    public ResponseEntity<?> createQuiz(
            @PathVariable Long moduleId,
            @RequestBody QuizDto quizDto) {

        try {
            log.info("Création d'un nouveau quiz pour la formation ID: {}", moduleId);
            QuizResponseDto createdQuiz = quizService.create(moduleId, quizDto);
            log.info("Quiz créé avec succès avec l'ID: {}", createdQuiz.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuiz);

        } catch (NotFoundException e) {
            log.error("Formation non trouvée: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Formation non trouvée", e.getMessage()));

        } catch (BadRequestException e) {
            log.error("Erreur de validation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Erreur de validation", e.getMessage()));

        } catch (Exception e) {
            log.error("Erreur inattendue lors de la création du quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur interne", "Une erreur inattendue s'est produite"));
        }
    }

    /**
     * Récupérer un quiz par son ID avec vérification de la formation
     */
    @GetMapping("/{moduleId}/getquizbyid/{quizId}")
    public ResponseEntity<?> getQuizById(
            @PathVariable Long moduleId,
            @PathVariable Long quizId) {

        try {
            log.info("Récupération du quiz ID: {} pour la formation ID: {}", quizId, moduleId);
            QuizResponseDto quiz = quizService.getById(quizId);

            // Vérifier si le quiz appartient bien à la formation
            if (!quiz.getModuleId().equals(moduleId)) {
                log.warn("Le quiz {} n'appartient pas à la formation {}", quizId, moduleId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Quiz non trouvé", "Le quiz n'appartient pas à cette formation"));
            }

            return ResponseEntity.ok(quiz);

        } catch (NotFoundException e) {
            log.error("Quiz non trouvé: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Quiz non trouvé", e.getMessage()));

        } catch (Exception e) {
            log.error("Erreur inattendue lors de la récupération du quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur interne", "Une erreur inattendue s'est produite"));
        }
    }

    /**
     * Récupérer tous les quizzes d'une formation
     */
    @GetMapping("/{moduleId}/getquizbymoduleId")
    public ResponseEntity<QuizResponseDto> getByModuleId(@PathVariable Long moduleId) {
        return ResponseEntity.ok(quizService.getQuizByModuleId(moduleId));
    }

    /**
     * Mettre à jour un quiz
     */
    @PutMapping("/{moduleId}/updatequiz/{quizId}")
    public ResponseEntity<?> updateQuiz(
            @PathVariable Long moduleId,
            @PathVariable Long quizId,
            @RequestBody QuizDto quizDto) {

        try {
            log.info("Mise à jour du quiz ID: {} pour la formation ID: {}", quizId, moduleId);

            // Vérifier d'abord que le quiz existe et appartient à la formation
            QuizResponseDto existingQuiz = quizService.getById(quizId);
            if (!existingQuiz.getModuleId().equals(moduleId)) {
                log.warn("Le quiz {} n'appartient pas à la formation {}", quizId, moduleId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Quiz non trouvé", "Le quiz n'appartient pas à cette formation"));
            }

            QuizResponseDto updatedQuiz = quizService.update(quizId, quizDto);
            log.info("Quiz mis à jour avec succès avec l'ID: {}", updatedQuiz.getId());

            return ResponseEntity.ok(updatedQuiz);

        } catch (NotFoundException e) {
            log.error("Quiz non trouvé: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Quiz non trouvé", e.getMessage()));

        } catch (BadRequestException e) {
            log.error("Erreur de validation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Erreur de validation", e.getMessage()));

        } catch (Exception e) {
            log.error("Erreur inattendue lors de la mise à jour du quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur interne", "Une erreur inattendue s'est produite"));
        }
    }



    /* update quiz chapitre*/

    @PutMapping("/chapitre/{chapitreId}/updatequiz/{quizId}")
    public ResponseEntity<?> updateQuizForChapitre(
            @PathVariable Long chapitreId,
            @PathVariable Long quizId,
            @RequestBody QuizDto quizDto) {

        try {
            log.info("Mise à jour du quiz ID: {} pour le chapitre ID: {}", quizId, chapitreId);

            // Vérifier d'abord que le quiz existe et appartient bien au chapitre
            QuizResponseDto existingQuiz = quizService.getById(quizId);
            if (existingQuiz.getChapitreId() == null || !existingQuiz.getChapitreId().equals(chapitreId)) {
                log.warn("Le quiz {} n'appartient pas au chapitre {}", quizId, chapitreId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Quiz non trouvé", "Le quiz n'appartient pas à ce chapitre"));
            }

            QuizResponseDto updatedQuiz = quizService.update(quizId, quizDto);
            log.info("Quiz de chapitre mis à jour avec succès avec l'ID: {}", updatedQuiz.getId());

            return ResponseEntity.ok(updatedQuiz);

        } catch (NotFoundException e) {
            log.error("Quiz non trouvé: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Quiz non trouvé", e.getMessage()));

        } catch (BadRequestException e) {
            log.error("Erreur de validation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Erreur de validation", e.getMessage()));

        } catch (Exception e) {
            log.error("Erreur inattendue lors de la mise à jour du quiz de chapitre", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur interne", "Une erreur inattendue s'est produite"));
        }
    }


    /**
     * Supprimer un quiz
     */
    @DeleteMapping("/{moduleId}/deletequiz/{quizId}")
    public ResponseEntity<?> deleteQuiz(
            @PathVariable Long moduleId,
            @PathVariable Long quizId) {

        try {
            log.info("Suppression du quiz ID: {} pour la formation ID: {}", quizId, moduleId);

            // Vérifier d'abord que le quiz existe et appartient à la formation
            QuizResponseDto existingQuiz = quizService.getById(quizId);
            if (!existingQuiz.getModuleId().equals(moduleId)) {
                log.warn("Le quiz {} n'appartient pas à la formation {}", quizId, moduleId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Quiz non trouvé", "Le quiz n'appartient pas à cette formation"));
            }

            quizService.delete(quizId);
            log.info("Quiz supprimé avec succès avec l'ID: {}", quizId);

            return ResponseEntity.ok(createSuccessResponse("Quiz supprimé avec succès"));

        } catch (NotFoundException e) {
            log.error("Quiz non trouvé: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Quiz non trouvé", e.getMessage()));

        } catch (Exception e) {
            log.error("Erreur inattendue lors de la suppression du quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur interne", "Une erreur inattendue s'est produite"));
        }
    }

    /**
     * Endpoint pour récupérer un quiz directement par son ID (sans vérification de formation)
     */
    @GetMapping("/getquizbyid/{quizId}")
    public ResponseEntity<?> getQuizByIdOnly(@PathVariable Long quizId) {

        try {
            log.info("Récupération du quiz ID: {}", quizId);
            QuizResponseDto quiz = quizService.getById(quizId);

            return ResponseEntity.ok(quiz);

        } catch (NotFoundException e) {
            log.error("Quiz non trouvé: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Quiz non trouvé", e.getMessage()));

        } catch (Exception e) {
            log.error("Erreur inattendue lors de la récupération du quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur interne", "Une erreur inattendue s'est produite"));
        }
    }

    /**
     * Créer une réponse d'erreur standardisée
     */
    private Map<String, Object> createErrorResponse(String error, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", error);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    /**
     * Créer une réponse de succès standardisée
     */
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }




    // 🔸 Créer un quiz pour un chapitre
    @PostMapping("/addquiztochapitre/{chapitreId}")
    public ResponseEntity<QuizResponseDto> createQuizForChapitre(
            @PathVariable Long chapitreId,
            @RequestBody QuizDto quizDto) {

        QuizResponseDto dto = quizService.createQuizForChapitre(chapitreId, quizDto);
        return ResponseEntity.ok(dto);
    }

    // 🔸 Créer un quiz final pour un module
    @PostMapping("/addquiztomodule/{moduleId}")
    public ResponseEntity<QuizResponseDto> createFinalQuizForModule(
            @PathVariable Long moduleId,
            @RequestBody QuizDto quizDto) {

        QuizResponseDto dto = quizService.createFinalQuizForModule(moduleId, quizDto);
        return ResponseEntity.ok(dto);
    }


    @GetMapping("/getquizbychapitreid/{id}")
    public QuizResponseDto getQuizByChapitre(@PathVariable("id") Long chapitreId) {
        return quizService.getQuizByChapitreId(chapitreId);
    }

    @DeleteMapping("/chapitre/{chapitreId}/quiz/{quizId}")
    public ResponseEntity<Void> deleteQuizForChapitre(
            @PathVariable Long chapitreId,
            @PathVariable Long quizId) {

        quizService.deleteQuizForChapitre(chapitreId, quizId);
        return ResponseEntity.noContent().build(); // HTTP 204
    }


}

