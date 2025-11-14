import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Apprenant } from 'src/app/models/apprenant';
import { Certification } from 'src/app/models/certification';
import { Module } from 'src/app/models/module';
import { ApprenantService } from 'src/app/services/apprenant.service';
import { CertificationService } from 'src/app/services/certification.service';
import { ModuleService } from 'src/app/services/module.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

// Interface étendue pour les certifications avec détails
interface CertificationWithDetails extends Certification {
  apprenantNom?: string;
  apprenantEmail?: string;
  moduleName?: string;
}

@Component({
  selector: 'app-list-certifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-certifications.component.html',
  styleUrl: './list-certifications.component.scss'
})
export class ListCertificationsComponent implements OnInit {
  
  formateurId!: number;
  certifications: CertificationWithDetails[] = [];
  modules: Module[] = [];
  apprenants: Map<number, Apprenant> = new Map();
 
  loading = true;
  error = false;
 
  // Filters
  searchTerm: string = '';
  sortBy: 'date' | 'score' | 'apprenant' | 'module' = 'date';
  filterModule: number | 'all' = 'all';
  filterScore: 'all' | 'excellent' | 'good' | 'average' = 'all';
 
  // Statistics
  stats = {
    totalCertifications: 0,
    averageScore: 0,
    excellentCount: 0, // >= 80%
    goodCount: 0, // >= 60%
    totalModules: 0,
    totalApprenants: 0
  };
 
  // Selected certification for modal
  selectedCertification: CertificationWithDetails | null = null;
  showCertificationModal = false;
 
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;

  constructor(
    private certificationService: CertificationService,
    private moduleService: ModuleService,
    private apprenantService: ApprenantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');
   
    if (!userId || userRole !== 'FORMATEUR') {
      Swal.fire({
        icon: 'error',
        title: 'Accès refusé',
        text: 'Cette page est réservée aux formateurs.',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/']);
      });
      return;
    }
   
    this.formateurId = +userId;
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading = true;
    this.error = false;
   
    try {
      await Promise.all([
        this.loadCertifications(),
        this.loadModules()
      ]);
     
      await this.loadApprenantDetails();
      this.enrichCertifications();
      this.calculateStatistics();
    } catch (error) {
      console.error('Error loading data:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  private loadCertifications(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.certificationService.getCertificationsByFormateur(this.formateurId).subscribe({
        next: (certs) => {
          this.certifications = certs || [];
          console.log('Certifications loaded:', certs);
          resolve();
        },
        error: (error) => {
          console.error('Error loading certifications:', error);
          this.certifications = [];
          resolve();
        }
      });
    });
  }

  private loadModules(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.moduleService.getModulesByFormateur(this.formateurId).subscribe({
        next: (modules) => {
          this.modules = modules || [];
          console.log('Modules loaded:', modules);
          resolve();
        },
        error: (error) => {
          console.error('Error loading modules:', error);
          this.modules = [];
          resolve();
        }
      });
    });
  }

  private async loadApprenantDetails(): Promise<void> {
    const apprenantIds = [...new Set(this.certifications.map(c => c.apprenantId))];
   
    const promises = apprenantIds.map(id =>
      new Promise<void>((resolve) => {
        this.apprenantService.getApprenantByid(id).subscribe({
          next: (apprenant) => {
            this.apprenants.set(id, apprenant);
            resolve();
          },
          error: (error) => {
            console.error(`Error loading apprenant ${id}:`, error);
            resolve();
          }
        });
      })
    );
   
    await Promise.all(promises);
  }

  private enrichCertifications(): void {
    this.certifications = this.certifications.map(cert => {
      const apprenant = this.apprenants.get(cert.apprenantId);
      const module = this.modules.find(m => m.id === cert.moduleId);
     
      return {
        ...cert,
        apprenantNom: apprenant ? `${apprenant.firstName} ${apprenant.lastName}` : 'Inconnu',
        apprenantEmail: apprenant?.email || '',
        moduleName: module?.titre || 'Module inconnu'
      };
    });
  }

  private calculateStatistics(): void {
    this.stats.totalCertifications = this.certifications.length;
    this.stats.totalModules = this.modules.length;
    this.stats.totalApprenants = this.apprenants.size;
   
    if (this.certifications.length > 0) {
      const totalScore = this.certifications.reduce((sum, c) => sum + (c.score || 0), 0);
      this.stats.averageScore = Math.round(totalScore / this.certifications.length);
     
      this.stats.excellentCount = this.certifications.filter(c => (c.score || 0) >= 80).length;
      this.stats.goodCount = this.certifications.filter(c => (c.score || 0) >= 60 && (c.score || 0) < 80).length;
    } else {
      this.stats.averageScore = 0;
      this.stats.excellentCount = 0;
      this.stats.goodCount = 0;
    }
  }

  // Filtering and sorting
  get filteredCertifications(): CertificationWithDetails[] {
    let filtered = [...this.certifications];
   
    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.titre.toLowerCase().includes(search) ||
        cert.apprenantNom?.toLowerCase().includes(search) ||
        cert.apprenantEmail?.toLowerCase().includes(search) ||
        cert.moduleName?.toLowerCase().includes(search)
      );
    }
   
    // Module filter
    if (this.filterModule !== 'all') {
      filtered = filtered.filter(cert => cert.moduleId === this.filterModule);
    }
   
    // Score filter
    if (this.filterScore !== 'all') {
      filtered = filtered.filter(cert => {
        const score = cert.score || 0;
        switch (this.filterScore) {
          case 'excellent': return score >= 80;
          case 'good': return score >= 60 && score < 80;
          case 'average': return score < 60;
          default: return true;
        }
      });
    }
   
    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return new Date(b.dateObtention!).getTime() - new Date(a.dateObtention!).getTime();
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'apprenant':
          return (a.apprenantNom || '').localeCompare(b.apprenantNom || '');
        case 'module':
          return (a.moduleName || '').localeCompare(b.moduleName || '');
        default:
          return 0;
      }
    });
   
    return filtered;
  }

  // Pagination
  get paginatedCertifications(): CertificationWithDetails[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCertifications.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCertifications.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Certification actions
  viewCertification(certification: CertificationWithDetails): void {
    this.selectedCertification = certification;
    this.showCertificationModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCertificationModal(): void {
    this.showCertificationModal = false;
    this.selectedCertification = null;
    document.body.style.overflow = 'auto';
  }

  viewApprenantProfile(apprenantId: number): void {
    this.router.navigate(['/learning/student/profil', apprenantId]);
  }

  viewModuleDetails(moduleId: number): void {
    this.router.navigate(['/learning/courses/overview', moduleId]);
  }

  sendCongratulations(certification: CertificationWithDetails): void {
    Swal.fire({
      title: 'Féliciter l\'apprenant',
      html: `
        <div class="text-start">
          <p><strong>Apprenant :</strong> ${certification.apprenantNom}</p>
          <p><strong>Module :</strong> ${certification.moduleName}</p>
          <p><strong>Score :</strong> ${certification.score}%</p>
          <hr>
          <label for="message" class="form-label">Message de félicitations :</label>
          <textarea id="message" class="form-control" rows="4" placeholder="Écrivez votre message...">
Félicitations ${certification.apprenantNom} pour votre excellente réussite !

Votre score de ${certification.score}% sur le module "${certification.moduleName}" démontre votre engagement et votre compréhension du sujet.

Continuez ainsi !
          </textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#28a745',
      preConfirm: () => {
        const message = (document.getElementById('message') as HTMLTextAreaElement).value;
        if (!message) {
          Swal.showValidationMessage('Veuillez écrire un message');
        }
        return message;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implémenter l'envoi d'email via backend
        Swal.fire({
          icon: 'success',
          title: 'Message envoyé !',
          text: 'Vos félicitations ont été envoyées à l\'apprenant.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // UI helpers
  getScoreClass(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bien';
    return 'Moyen';
  }

  getModuleImage(moduleId: number): string {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module?.image) {
      return 'assets/images/learning/default.png';
    }
    if (module.image.startsWith('http')) {
      return module.image;
    }
    return `${environment.baseUrl}/uploads/images/${module.image}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
   
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(dateString: string): string {
    if (!dateString) return 'N/A';
   
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
   
    Swal.fire({
      icon: 'success',
      title: 'Données actualisées',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }

  // Export functionality
  exportToCSV(): void {
    if (this.filteredCertifications.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune donnée',
        text: 'Il n\'y a aucune certification à exporter.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const csvData = this.filteredCertifications.map(c => ({
      'Apprenant': c.apprenantNom || '',
      'Email': c.apprenantEmail || '',
      'Module': c.moduleName || '',
      'Score': c.score || 0,
      'Date': this.formatDate(c.dateObtention!),
      'ID Certification': c.id || ''
    }));
   
    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n');
   
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
   
    link.setAttribute('href', url);
    link.setAttribute('download', `certifications-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
   
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
   
    Swal.fire({
      icon: 'success',
      title: 'Export réussi',
      text: 'Le fichier CSV a été téléchargé.',
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Clear filters
  clearFilters(): void {
    this.searchTerm = '';
    this.filterModule = 'all';
    this.filterScore = 'all';
    this.sortBy = 'date';
    this.currentPage = 1;
  }
}

