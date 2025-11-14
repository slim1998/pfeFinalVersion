// certification.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Certification } from 'src/app/models/certification';
import { Module } from 'src/app/models/module';
import { CertificationService } from 'src/app/services/certification.service';
import { ModuleService } from 'src/app/services/module.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-certification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certification.component.html',
   styleUrls: ['./certification.component.scss'] 
})
export class CertificationComponent implements OnInit {

  apprenantId!: number;
  certifications: Certification[] = [];
  modules: Module[] = [];
  
  loading = true;
  error = false;
  
  // Filters
  searchTerm: string = '';
  sortBy: 'date' | 'score' | 'name' = 'date';
  
  // Statistics
  stats = {
    totalCertifications: 0,
    averageScore: 0,
    highestScore: 0,
    totalModules: 0
  };
  
  // Selected certification for modal
  selectedCertification: Certification | null = null;
  showCertificationModal = false;
  
  breadCrumbItems: Array<{}> = [];

  constructor(
    private certificationService: CertificationService,
    private moduleService: ModuleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeBreadcrumbs();
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.apprenantId = +userId;
    this.loadData();
  }

  private initializeBreadcrumbs(): void {
    this.breadCrumbItems = [
      { label: 'Apprentissage', active: false },
      { label: 'Mes Certifications', active: true }
    ];
  }

  private async loadData(): Promise<void> {
    this.loading = true;
    this.error = false;
    
    try {
      await Promise.all([
        this.loadCertifications(),
        this.loadModules()
      ]);
      
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
      this.certificationService.getCertificationsByApprenant(this.apprenantId).subscribe({
        next: (certs) => {
          this.certifications = certs || [];
          console.log('Certifications loaded:', certs);
          resolve();
        },
        error: (error) => {
          console.error('Error loading certifications:', error);
          this.certifications = [];
          resolve(); // Continue même en cas d'erreur
        }
      });
    });
  }

  private loadModules(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.moduleService.getAcceptedModules(this.apprenantId).subscribe({
        next: (modules) => {
          this.modules = modules || [];
          console.log('Modules loaded:', modules);
          resolve();
        },
        error: (error) => {
          console.error('Error loading modules:', error);
          this.modules = [];
          resolve(); // Continue même en cas d'erreur
        }
      });
    });
  }

  private calculateStatistics(): void {
    this.stats.totalCertifications = this.certifications.length;
    this.stats.totalModules = this.modules.length;
    
    if (this.certifications.length > 0) {
      const totalScore = this.certifications.reduce((sum, c) => sum + (c.score || 0), 0);
      this.stats.averageScore = Math.round(totalScore / this.certifications.length);
      this.stats.highestScore = Math.max(...this.certifications.map(c => c.score || 0));
    } else {
      this.stats.averageScore = 0;
      this.stats.highestScore = 0;
    }
  }

  // Filtering and sorting
  get filteredCertifications(): Certification[] {
    let filtered = [...this.certifications];
    
    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cert => 
        cert.titre.toLowerCase().includes(search) ||
        this.getModuleName(cert.moduleId).toLowerCase().includes(search)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return new Date(b.dateObtention!).getTime() - new Date(a.dateObtention!).getTime();
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'name':
          return a.titre.localeCompare(b.titre);
        default:
          return 0;
      }
    });
    
    return filtered;
  }

  // Certification actions
  viewCertification(certification: Certification): void {
    this.selectedCertification = certification;
    this.showCertificationModal = true;
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }

  closeCertificationModal(): void {
    this.showCertificationModal = false;
    this.selectedCertification = null;
    // Réactiver le scroll du body
    document.body.style.overflow = 'auto';
  }

  downloadCertification(certification: Certification): void {
    Swal.fire({
      title: 'Télécharger la Certification',
      html: `
        <div class="text-center">
          <p class="mb-3">Choisissez le format de téléchargement :</p>
          <div class="d-grid gap-2">
            <button class="btn btn-primary" id="downloadPdfBtn">
              <i class="fas fa-file-pdf me-2"></i>Télécharger en PDF
            </button>
            <button class="btn btn-outline-primary" id="downloadImageBtn">
              <i class="fas fa-image me-2"></i>Télécharger en Image
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      didOpen: () => {
        document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
          this.downloadAsPDF(certification);
          Swal.close();
        });
        
        document.getElementById('downloadImageBtn')?.addEventListener('click', () => {
          this.downloadAsImage(certification);
          Swal.close();
        });
      }
    });
  }

  private downloadAsPDF(certification: Certification): void {
    Swal.fire({
      icon: 'info',
      title: 'Téléchargement PDF',
      text: 'La fonctionnalité de téléchargement PDF sera bientôt disponible.',
      confirmButtonText: 'OK'
    });
    
    // TODO: Implémenter avec jsPDF
    // import jsPDF from 'jspdf';
    // const doc = new jsPDF();
    // doc.text(`Certification: ${certification.titre}`, 10, 10);
    // doc.save(`certification-${certification.id}.pdf`);
  }

  private downloadAsImage(certification: Certification): void {
    Swal.fire({
      icon: 'info',
      title: 'Téléchargement Image',
      text: 'La fonctionnalité de téléchargement image sera bientôt disponible.',
      confirmButtonText: 'OK'
    });
    
    // TODO: Implémenter avec html2canvas
    // import html2canvas from 'html2canvas';
    // const element = document.querySelector('.certificate-container');
    // html2canvas(element).then(canvas => {
    //   const link = document.createElement('a');
    //   link.download = `certification-${certification.id}.png`;
    //   link.href = canvas.toDataURL();
    //   link.click();
    // });
  }

  shareCertification(certification: Certification): void {
    const shareText = `J'ai obtenu ma certification "${certification.titre}" avec un score de ${certification.score}%!`;
    const shareUrl = window.location.href;
    
    Swal.fire({
      title: 'Partager la Certification',
      html: `
        <div class="text-center">
          <p class="mb-3">Partagez votre réussite :</p>
          <div class="d-grid gap-2">
            <button class="btn btn-primary" id="linkedinBtn">
              <i class="fab fa-linkedin me-2"></i>Partager sur LinkedIn
            </button>
            <button class="btn btn-info text-white" id="twitterBtn">
              <i class="fab fa-twitter me-2"></i>Partager sur Twitter
            </button>
            <button class="btn btn-success" id="facebookBtn">
              <i class="fab fa-facebook me-2"></i>Partager sur Facebook
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Fermer',
      didOpen: () => {
        document.getElementById('linkedinBtn')?.addEventListener('click', () => {
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        });
        
        document.getElementById('twitterBtn')?.addEventListener('click', () => {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        });
        
        document.getElementById('facebookBtn')?.addEventListener('click', () => {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        });
      }
    });
  }

  viewModuleDetails(moduleId: number): void {
    this.router.navigate(['/learning/courses/overview', moduleId]);
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

  getModuleName(moduleId: number): string {
    const module = this.modules.find(m => m.id === moduleId);
    return module?.titre || 'Module inconnu';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getProgressPercentage(): number {
    if (this.modules.length === 0) return 0;
    return Math.round((this.certifications.length / this.modules.length) * 100);
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
  exportResults(): void {
    Swal.fire({
      icon: 'info',
      title: 'Export des certifications',
      html: `
        <p>La fonctionnalité d'export sera bientôt disponible.</p>
        <p class="text-muted">Vous pourrez exporter vos certifications en CSV ou Excel.</p>
      `,
      confirmButtonText: 'OK'
    });
    
    // TODO: Implémenter l'export
    // const csvData = this.certifications.map(c => ({
    //   Titre: c.titre,
    //   Module: this.getModuleName(c.moduleId),
    //   Score: c.score,
    //   Date: this.formatDate(c.dateObtention!)
    // }));
    // // Convertir en CSV et télécharger
  }
}