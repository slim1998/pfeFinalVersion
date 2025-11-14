
export interface Review {
  id: number;
  commentaire: string;
  rating: number;

  date: string;

  apprenantId?: number;
  apprenantName?: string;

  moduleId?: number;
  moduleName?: string;
  moduleImage?: string;

  visible: boolean;
}
