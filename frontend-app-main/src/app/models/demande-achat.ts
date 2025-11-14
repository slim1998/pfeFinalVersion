import { Apprenant } from "./apprenant";

export class DemandeAchat {

  id?: number;

  apprenantId?: number;
  apprenantNom?: string;
    apprenantEmail?: string;
    phone?: string;
    adress?: string
   apprenant?: Apprenant;
   moduleId?: number;
  moduleTitre?: string;
  dateDemande?: string;
  prixFinal?: number;
  statut?: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

}






