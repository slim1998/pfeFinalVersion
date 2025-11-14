package com.dto;

import com.dto.QuestionDto;
import com.entities.Quiz;
import com.entities.Question;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class QuizDto {
    private String title;
    private String description;
    private List<QuestionDto> questions;

    /**
     * Convertit ce DTO en entité Quiz
     */
    public Quiz toEntity() {
        Quiz quiz = Quiz.builder()
                .title(this.title)
                .description(this.description)
                .build();

        if (this.questions != null) {
            for (QuestionDto questionDto : this.questions) {
                Question question = questionDto.toEntity();
                quiz.addQuestion(question);
            }
        }

        return quiz;
    }

    /**
     * Crée un QuizDto à partir d'une entité Quiz
     */
    public static QuizDto fromEntity(Quiz quiz) {
        if (quiz == null) {
            return null;
        }

        List<QuestionDto> questionDtos = null;
        if (quiz.getQuestions() != null) {
            questionDtos = quiz.getQuestions().stream()
                    .map(QuestionDto::fromEntity)
                    .toList();
        }

        return QuizDto.builder()
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .questions(questionDtos)
                .build();
    }
}