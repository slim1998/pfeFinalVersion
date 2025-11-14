export interface Certification {
 id?: number;
  titre: string;
  dateObtention?: string; // ISO string
  apprenantId: number;
  score?: number;
  moduleId: number;
  quizId?: number;

}
