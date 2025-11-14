import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuItem, UserRole } from '../layouts/sidebar/menu.model';
import { MENU } from '../layouts/sidebar/menu';


@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private currentUserRole$ = new BehaviorSubject<string>('');
  private menuItems$ = new BehaviorSubject<MenuItem[]>([]);

  constructor() {
    // Initialiser avec le rôle du localStorage au démarrage
    this.initializeUserRole();
  }

  /**
   * Initialise le rôle utilisateur depuis le localStorage
   */
  private initializeUserRole(): void {
    const role = this.getUserRoleFromStorage();
    this.setUserRole(role);
  }

  /**
   * Récupère le rôle depuis le localStorage
   */
  private getUserRoleFromStorage(): string {
    try {
      // Récupérer directement depuis localStorage.getItem('role')
      const role = localStorage.getItem('role');
      
      return role ? role : '';
    }
    catch (error) {
      console.error('Erreur lors de la récupération du rôle depuis le localStorage:', error);
      return '';
    }
  }

  /**
   * Met à jour le rôle utilisateur et filtre le menu
   */
  setUserRole(role: string): void {
    this.currentUserRole$.next(role);
    const filteredMenu = this.filterMenuByRole(MENU, role);
    this.menuItems$.next(filteredMenu);
    
    // Sauvegarder le rôle dans localStorage avec la clé 'role'
    localStorage.setItem('role', role);
  }

  /**
   * Récupère le rôle utilisateur actuel
   */
  getCurrentUserRole(): Observable<string> {
    return this.currentUserRole$.asObservable();
  }

  /**
   * Récupère les éléments du menu filtrés
   */
  getMenuItems(): Observable<MenuItem[]> {
    return this.menuItems$.asObservable();
  }

  /**
   * Filtre le menu selon le rôle
   */
  private filterMenuByRole(menuItems: MenuItem[], userRole: string): MenuItem[] {
    return menuItems
      .filter(item => this.hasRoleAccess(item, userRole))
      .map(item => {
        if (item.subItems && item.subItems.length > 0) {
          return {
            ...item,
            subItems: this.filterMenuByRole(item.subItems, userRole)
          };
        }
        return item;
      })
      .filter(item => {
        if (item.subItems) {
          return item.subItems.length > 0;
        }
        return true;
      });
  }

  /**
   * Vérifie l'accès selon le rôle
   */
  private hasRoleAccess(item: MenuItem, userRole: string): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    // Convertir userRole en UserRole enum pour la comparaison
    const userRoleEnum = userRole as UserRole;
    return item.roles.includes(userRoleEnum);
  }

  /**
   * Réinitialise le menu (utile lors de la déconnexion)
   */
  resetMenu(): void {
    this.currentUserRole$.next('');
    this.menuItems$.next([]);
    localStorage.removeItem('role'); // Utiliser la clé 'role'
  }

  /**
   * Met à jour le menu quand l'utilisateur change (connexion/déconnexion)
   */
  refreshMenu(): void {
    const role = this.getUserRoleFromStorage();
    this.setUserRole(role);
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): boolean {
    return this.currentUserRole$.value === role;
  }

  /**
   * Vérifie si l'utilisateur a l'un des rôles spécifiés
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.currentUserRole$.value as UserRole;
    return roles.includes(currentRole);
  }

  /**
   * Trouve un élément de menu par son lien
   */
  findMenuItemByLink(link: string): MenuItem | null {
    const findInItems = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.link === link) {
          return item;
        }
        if (item.subItems && item.subItems.length > 0) {
          const found = findInItems(item.subItems);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return findInItems(this.menuItems$.value);
  }
}