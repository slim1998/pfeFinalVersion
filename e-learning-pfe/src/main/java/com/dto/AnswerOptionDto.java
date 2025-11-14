package com.dto;

import com.entities.AnswerOption;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class AnswerOptionDto {
    private String text;
    private boolean correct;

    /**
     * Convertit ce DTO en entité AnswerOption
     */
    public AnswerOption toEntity() {
        return AnswerOption.builder()
                .text(this.text)
                .correct(this.correct)
                .build();
    }

    /**
     * Crée un AnswerOptionDto à partir d'une entité AnswerOption
     */
    public static AnswerOptionDto fromEntity(AnswerOption answerOption) {
        if (answerOption == null) {
            return null;
        }

        return AnswerOptionDto.builder()
                .text(answerOption.getText())
                .correct(answerOption.isCorrect())
                .build();
    }
}