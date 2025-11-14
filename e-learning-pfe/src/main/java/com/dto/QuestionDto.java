package com.dto;

import com.entities.Question;
import com.entities.AnswerOption;
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
public class QuestionDto {

    private String text;
    private Integer points; // optionnel, défaut = 1
    private List<AnswerOptionDto> answerOptions;

    /**
     * Convertit ce DTO en entité Question
     */
    public Question toEntity() {
        Question question = Question.builder()
                .text(this.text)
                .points(this.points == null ? 1 : this.points)
                .build();

        if (this.answerOptions != null) {
            for (AnswerOptionDto optionDto : this.answerOptions) {
                AnswerOption option = optionDto.toEntity();
                question.addOption(option);
            }
        }

        return question;
    }

    /**
     * Crée un QuestionDto à partir d'une entité Question
     */
    public static QuestionDto fromEntity(Question question) {
        if (question == null) {
            return null;
        }

        List<AnswerOptionDto> optionDtos = null;
        if (question.getOptions() != null) {
            optionDtos = question.getOptions().stream()
                    .map(AnswerOptionDto::fromEntity)
                    .toList();
        }

        return QuestionDto.builder()
                .text(question.getText())
                .points(question.getPoints())
                .answerOptions(optionDtos)
                .build();
    }
}