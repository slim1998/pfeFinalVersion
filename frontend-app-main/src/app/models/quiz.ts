// quiz.model.ts - Updated with complete interfaces

export interface AnswerOptionDto {
  id?: number;
  text: string;
  correct: boolean;
}

export interface QuestionDto {
  id?: number;
  text: string;
  points?: number;
  answerOptions: AnswerOptionDto[];
}

export interface QuizDto {
  id?: number;
  title: string;
  description?: string;
  questions: QuestionDto[];
}

// Response shapes (ce que renvoie ton backend)
export interface OptionResponseDto {
  id: number;
  text: string;
  correct: boolean;
}

export interface QuestionResponseDto {
  id: number;
  text: string;
  points: number;
  options: OptionResponseDto[]; // backend utilise "options" dans la réponse
}

export interface QuizResponseDto {
  id: number;
  title: string;
  description?: string;
  formationId?: number;
  chapitreId?: number; // Ajout pour les quiz de chapitres
  questions: QuestionResponseDto[];
}

// Interface pour le progrès du quiz
export interface QuizProgress {
  chapitreId: number;
  quizId: number;
  score: number;
  completedAt: Date;
  answers: { [questionId: number]: number };
}

// Interface pour les statistiques du quiz
export interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent?: number;
  attempts: number;
}
