package com.dto;

import com.entities.AnswerOption;
import com.entities.Question;
import com.entities.Quiz;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class QuizResponseDto {

    private Long id;
    private String title;
    private String description;
    private Long moduleId;
    private Long chapitreId;
    private List<QuestionResponseDto> questions;

    /**
     * Crée un QuizResponseDto à partir d'une entité Quiz
     */
    public static QuizResponseDto fromEntity(Quiz quiz) {
        if (quiz == null) {
            return null;
        }

        List<QuestionResponseDto> questionResponses = null;
        if (quiz.getQuestions() != null) {
            questionResponses = quiz.getQuestions().stream()
                    .map(QuestionResponseDto::fromEntity)
                    .collect(Collectors.toList());
        }

        return QuizResponseDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .moduleId(quiz.getModule() != null ? quiz.getModule().getId() : null)
                .chapitreId(quiz.getChapitre() !=null ? quiz.getChapitre().getId() : null)
                .questions(questionResponses)
                .build();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResponseDto {
        private Long id;
        private String text;
        private Integer points;
        private List<OptionResponseDto> options;

        /**
         * Crée un QuestionResponseDto à partir d'une entité Question
         */
        public static QuestionResponseDto fromEntity(Question question) {
            if (question == null) {
                return null;
            }

            List<OptionResponseDto> optionResponses = null;
            if (question.getOptions() != null) {
                optionResponses = question.getOptions().stream()
                        .map(OptionResponseDto::fromEntity)
                        .collect(Collectors.toList());
            }

            return QuestionResponseDto.builder()
                    .id(question.getId())
                    .text(question.getText())
                    .points(question.getPoints())
                    .options(optionResponses)
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionResponseDto {
        private Long id;
        private String text;
        private boolean correct;

        /**
         * Crée un OptionResponseDto à partir d'une entité AnswerOption
         */
        public static OptionResponseDto fromEntity(AnswerOption answerOption) {
            if (answerOption == null) {
                return null;
            }

            return OptionResponseDto.builder()
                    .id(answerOption.getId())
                    .text(answerOption.getText())
                    .correct(answerOption.isCorrect())
                    .build();
        }
    }
}
