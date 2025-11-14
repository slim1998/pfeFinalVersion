// src/app/shared/menus/custom-menu.ts
import { MenuItem } from './menu.model'; // adapte le chemin si nécessaire

export const getAdminMenu = (): MenuItem[] => [
  {
    id: 1,
    label: 'Gestion Formateurs',
    icon: 'ph-user-circle',
    link: '/admin/formateurs'
  },
  {
    id: 2,
    label: 'Gestion Apprenants',
    icon: 'ph-users',
    link: '/admin/apprenants'
  },
  {
    id: 3,
    label: 'Gestion Catégories',
    icon: 'ph-folder',
    link: '/admin/categories'
  },
  {
    id: 4,
    label: 'Droits d\'accès',
    icon: 'ph-shield',
    link: '/admin/droits'
  }
];

export const getFormateurMenu = (): MenuItem[] => [
  {
    id: 5,
    label: 'Gestion Formations',
    icon: 'ph-chalkboard-teacher',
    link: '/formateur/formations'
  },
  {
    id: 6,
    label: 'Éditer Profil',
    icon: 'ph-user',
    link: '/formateur/profil'
  },
  {
    id: 7,
    label: 'Commenter',
    icon: 'ph-chat-teardrop',
    link: '/formateur/commentaires'
  },
  {
    id: 8,
    label: 'Gestion Quiz & Examens',
    icon: 'ph-book-open-text',
    link: '/formateur/quiz-examens'
  }
];

export const getApprenantMenu = (): MenuItem[] => [
  {
    id: 9,
    label: 'Éditer Profil',
    icon: 'ph-user',
    link: '/apprenant/profil'
  },
  {
    id: 10,
    label: 'Commenter',
    icon: 'ph-chat-circle',
    link: '/apprenant/commentaires'
  },
  {
    id: 11,
    label: 'Passer un Examen',
    icon: 'ph-pencil-circle',
    link: '/apprenant/examen'
  },
  {
    id: 12,
    label: 'S\'inscrire à une Formation',
    icon: 'ph-file-plus',
    link: '/apprenant/inscription'
  },
  {
    id: 13,
    label: 'Suivre une Formation',
    icon: 'ph-book-bookmark',
    link: '/apprenant/formation'
  }
];
