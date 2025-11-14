import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApprenantService } from 'src/app/services/apprenant.service';
import { FormateurService } from 'src/app/services/formateur.service';
import { ModuleService } from 'src/app/services/module.service';
import { CategorieService } from 'src/app/services/categorie.service';
import { DemandeAchatService } from 'src/app/services/demande-achat.service';
import { CertificationService } from 'src/app/services/certification.service';
import { ReviewService } from 'src/app/services/review.service';


@Component({
  selector: 'app-dashboard-user',
  templateUrl: './dashboard-user.component.html',
  styleUrls: ['./dashboard-user.component.scss']
})
export class DashboardUserComponentComponent implements OnInit {
  breadCrumbItems: Array<{}> = [];
  isLoading = true;
  
  // User Info
  userRole: string = '';
  userId: number = 0;
  userName: string = '';

  // Admin Stats
  stats = {
    totalApprenants: 0,
    totalFormateurs: 0,
    totalModules: 0,
    demandesEnAttente: 0
  };

  // Formateur Stats
  formateurStats = {
    totalModules: 0,
    totalApprenants: 0,
    totalCertifications: 0
  };

  // Apprenant Stats
  apprenantStats = {
    modulesAchetes: 0,
    certifications: 0,
    demandesEnCours: 0,
    reviewsCount: 0
  };

  // Data Lists
  recentDemandes: any[] = [];
  topCategories: any[] = [];
  myModules: any[] = [];
  myPurchasedModules: any[] = [];
  recentReviews: any[] = [];
  myCertifications: any[] = [];

  constructor(
    private router: Router,
    private apprenantService: ApprenantService,
    private formateurService: FormateurService,
    private moduleService: ModuleService,
    private categorieService: CategorieService,
    private demandeAchatService: DemandeAchatService,
    private certificationService: CertificationService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', active: true }
    ];

    this.loadUserInfo();
    this.loadDashboardData();
  }

  loadUserInfo(): void {
    this.userRole = localStorage.getItem('role') || '';
    this.userId = Number(localStorage.getItem('userId')) || 0;
    this.userName = localStorage.getItem('fullName') || 'Utilisateur';
    
    console.log('User Role:', this.userRole);
    console.log('User ID:', this.userId);
  }

  loadDashboardData(): void {
    switch (this.userRole) {
      case 'ADMINISTRATEUR':
        this.loadAdminDashboard();
        break;
      case 'FORMATEUR':
        this.loadFormateurDashboard();
        break;
      case 'APPRENANT':
        this.loadApprenantDashboard();
        break;
      default:
        console.error('Unknown role:', this.userRole);
        this.isLoading = false;
    }
  }

  // ==================== ADMIN DASHBOARD ====================
  loadAdminDashboard(): void {
    forkJoin({
      apprenants: this.apprenantService.getAllApprenants(),
      formateurs: this.formateurService.getAllFormateurs(),
      modules: this.moduleService.getAllModule(),
      demandes: this.demandeAchatService.getAllDemandeAchat(),
      categories: this.categorieService.getAllCategories()
    }).subscribe({
      next: (data) => {
        // Stats
        this.stats.totalApprenants = data.apprenants.length;
        this.stats.totalFormateurs = data.formateurs.length;
        this.stats.totalModules = data.modules.length;
        this.stats.demandesEnAttente = data.demandes.filter(
          (d: any) => d.statut === 'EN_ATTENTE'
        ).length;

        // Recent demandes (10 dernières)
        this.recentDemandes = data.demandes
          .sort((a: any, b: any) => 
            new Date(b.dateDemande).getTime() - new Date(a.dateDemande).getTime()
          )
          .slice(0, 10)
          .map((d: any) => ({
            ...d,
            apprenantName: this.getApprenantName(d.apprenantId, data.apprenants),
            moduleName: this.getModuleName(d.moduleId, data.modules)
          }));

        // Top categories
        const categoryCount: any = {};
        data.modules.forEach((m: any) => {
          if (m.categorieId) {
            categoryCount[m.categorieId] = (categoryCount[m.categorieId] || 0) + 1;
          }
        });

        this.topCategories = data.categories
          .map((cat: any) => ({
            ...cat,
            moduleCount: categoryCount[cat.id] || 0
          }))
          .sort((a: any, b: any) => b.moduleCount - a.moduleCount)
          .slice(0, 5);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading admin dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  updateDemandeStatut(demandeId: number, statut: string): void {
    this.demandeAchatService.updateDemandeStatut(demandeId, statut).subscribe({
      next: () => {
        console.log('Statut updated successfully');
        this.loadAdminDashboard(); // Reload data
      },
      error: (error) => {
        console.error('Error updating statut:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  // ==================== FORMATEUR DASHBOARD ====================
  loadFormateurDashboard(): void {
    forkJoin({
      modules: this.moduleService.getModulesByFormateur(this.userId),
      apprenants: this.formateurService.getApprenantsByFormateur(this.userId),
      certifications: this.certificationService.getCertificationsByFormateur(this.userId),
      reviews: this.reviewService.getAllReviews()
    }).subscribe({
      next: (data) => {
        this.formateurStats.totalModules = data.modules.length;
        this.formateurStats.totalApprenants = data.apprenants.length;
        this.formateurStats.totalCertifications = data.certifications.length;

        this.myModules = data.modules.slice(0, 5);

        // Recent reviews for formateur's modules
        const moduleIds = data.modules.map((m: any) => m.id);
        this.recentReviews = data.reviews
          .filter((r: any) => moduleIds.includes(r.moduleId))
          .sort((a: any, b: any) => 
            new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
          )
          .slice(0, 5);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading formateur dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  // ==================== APPRENANT DASHBOARD ====================
  loadApprenantDashboard(): void {
    forkJoin({
      purchasedModules: this.moduleService.getAcceptedModules(this.userId),
      certifications: this.certificationService.getCertificationsByApprenant(this.userId),
      demandes: this.demandeAchatService.getAllDemandeAchat(),
      reviews: this.reviewService.getAllReviews()
    }).subscribe({
      next: (data) => {
        this.apprenantStats.modulesAchetes = data.purchasedModules.length;
        this.apprenantStats.certifications = data.certifications.length;
        
        // Demandes en cours (EN_ATTENTE)
        this.apprenantStats.demandesEnCours = data.demandes.filter(
          (d: any) => d.apprenantId === this.userId && d.statut === 'EN_ATTENTE'
        ).length;

        // Reviews donnés par cet apprenant
        this.apprenantStats.reviewsCount = data.reviews.filter(
          (r: any) => r.apprenantId === this.userId
        ).length;

        // Modules achetés
        this.myPurchasedModules = data.purchasedModules.slice(0, 6);

        // Certifications
        this.myCertifications = data.certifications;

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading apprenant dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  // ==================== HELPER METHODS ====================
  getApprenantName(apprenantId: number, apprenants: any[]): string {
    const apprenant = apprenants.find((a: any) => a.id === apprenantId);
    return apprenant ? `${apprenant.firstName} ${apprenant.lastName}` : 'N/A';
  }

  getModuleName(moduleId: number, modules: any[]): string {
    const module = modules.find((m: any) => m.id === moduleId);
    return module ? module.titre : 'N/A';
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'bg-warning-subtle text-warning';
      case 'ACCEPTE':
        return 'bg-success-subtle text-success';
      case 'REFUSE':
        return 'bg-danger-subtle text-danger';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'BEGINNER':
        return 'bg-success-subtle text-success';
      case 'INTERMEDIATE':
        return 'bg-warning-subtle text-warning';
      case 'ADVENCED':
        return 'bg-danger-subtle text-danger';
      case 'ALL_LEVEL':
        return 'bg-info-subtle text-info';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  navigateToModule(moduleId: number): void {
    if (moduleId) {
      this.router.navigate(['/learning/courses/overview', moduleId]);
    }
  }
}