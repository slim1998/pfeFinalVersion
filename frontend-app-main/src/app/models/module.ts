import { Chapitre } from "./chapitre";

export interface Module {


  id?: number;
  titre: string;
  short_description: string;
  long_description: string;
   level?: Level;             // tu peux définir un enum séparé si nécessaire
  lectureTime?: string;      // LocalDateTime est représenté en string côté Angular
  image?: string;
  video?: string;
  prixInitial: number;
  discount?: number;
  categorieId?: number;
  formateurId?: number;
  formateurName? : string;
  formateurPhoto? : string;

  chapitres? : Chapitre[];

    canAccess?: boolean;           // le flag envoyé par ton endpoint



}
export enum Level {
    ALL_LEVEL = 'ALL_LEVEL',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVENCED  = 'ADVENCED'
}



