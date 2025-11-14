package com.entities;

import com.entities.Question;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Quiz {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private String title;


    private String description;


    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "module_id", nullable = true)
    private Module module;

    // Quiz local (lié à un chapitre spécifique)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapitre_id", nullable = true)
    private Chapitre chapitre;


    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Question> questions = new ArrayList<>();


    public void addQuestion(Question q) {
        q.setQuiz(this);
        this.questions.add(q);
    }
}

