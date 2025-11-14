package com.controllers;

import com.Services.LessonService;
import com.dto.LessonDto;
import com.exeptions.LessonNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lesson")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    // Ajouter une leçon
    @PostMapping("/addlesson")
    public ResponseEntity<?> addLesson(@RequestBody LessonDto lessonDto) {
        try {
            LessonDto createdLesson = lessonService.addLesson(lessonDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLesson);
        } catch (Exception e) {
            // Retourner un JSON structuré pour l’erreur
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error creating lesson", e.getMessage()));
        }
    }

    // Récupérer une leçon par ID
    @GetMapping("/getlessonbyid/{id}")
    public ResponseEntity<?> getLessonById(@PathVariable Long id) {
        try {
            LessonDto lesson = lessonService.getLessonById(id);
            return ResponseEntity.ok(lesson);
        } catch (LessonNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Lesson not found", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error retrieving lesson", e.getMessage()));
        }
    }

    // Lister toutes les leçons
    @GetMapping("/getalllessons")
    public ResponseEntity<List<LessonDto>> getAllLessons() {
        List<LessonDto> lessons = lessonService.getLessons();
        return ResponseEntity.ok(lessons);
    }

    // Supprimer une leçon par ID
    @DeleteMapping("/deltelesson/{id}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long id) {
        try {
            lessonService.deleteLessonById(id);
            return ResponseEntity.noContent().build();
        } catch (LessonNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Lesson not found", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error deleting lesson", e.getMessage()));
        }
    }

    // Récupérer les leçons par chapitre
    @GetMapping("/getlessonsbychapitreid/{chapitreId}")
    public ResponseEntity<List<LessonDto>> getLessonsByChapitre(@PathVariable Long chapitreId) {
        List<LessonDto> lessons = lessonService.getLessonsByChapitreId(chapitreId);
        return ResponseEntity.ok(lessons);
    }

    // Classe interne pour les erreurs JSON
    static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() { return error; }
        public String getMessage() { return message; }
    }
}

