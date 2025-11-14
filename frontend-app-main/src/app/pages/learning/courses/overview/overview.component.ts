// overview.component.ts - Enhanced with automatic certification generation

import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ModuleService } from 'src/app/services/module.service';
import { Module, Level } from 'src/app/models/module';
import { environment } from 'src/environments/environment';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { DemandeAchatService } from 'src/app/services/demande-achat.service';
import { DemandeAchat } from 'src/app/models/demande-achat';
import { Apprenant } from 'src/app/models/apprenant';
import { ApprenantService } from 'src/app/services/apprenant.service';
import Swal from 'sweetalert2';
import { Chapitre } from 'src/app/models/chapitre';
import { ChapitreService } from 'src/app/services/chapitre.service';
import { LessonService } from 'src/app/services/lesson.service';
import { Lesson } from 'src/app/models/lesson';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuizService } from 'src/app/services/quiz.service';
import { QuizResponseDto, QuestionResponseDto, QuizDto } from 'src/app/models/quiz';
import { CertificationService } from 'src/app/services/certification.service';
import { Certification } from 'src/app/models/certification';
import { Review } from 'src/app/models/review';
import { ReviewService } from 'src/app/services/review.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  moduleId!: number;
  module: Module | null = null;
  loading = true;
  error = false;
  showModal = false;
  demande: DemandeAchat = {};
  Math = Math;
  String = String;

  apprenant!: Apprenant;
  moduleTitre!: string;
  prixInitial!: number;
  apprenantId!: number;
  apprenantNom!: string;
  apprenantEmail!: string;
  phone!: string;
  adress!: string;

  // Access Control - KEY PROPERTIES
  canAccess: boolean = false;
  accessCheckComplete: boolean = false;

  // Tab management
  currentTab: string = 'description';

  // Video/Lesson management
  currentVideoUrl: string | null = null;
  currentVideoTitle: string = '';
  isWatchingLesson: boolean = false;
  currentLesson: Lesson | null = null;
  selectedChapter: Chapitre | null = null;
reviewTotal: number = 0;
  // Quiz management
  chapterQuizzes: Map<number, QuizResponseDto> = new Map();
  activeQuizId: number | null = null;
  currentQuestion: QuestionResponseDto | null = null;
  currentQuestionIndex: number = 0;
  totalQuestions: number = 0;
  selectedAnswers: { [questionId: number]: number } = {};
  showQuizResults: boolean = false;
  completedQuiz: QuizResponseDto | null = null;
  quizScore: number = 0;
  correctAnswers: number = 0;
  completedQuizzes: Set<number> = new Set();
  quiz!: QuizDto

  // Final Exam Properties
  showFinalExamModal: boolean = false;
  finalExam: QuizResponseDto | null = null;
  examStartTime: Date | null = null;
  examDuration: number = 60; // 60 minutes
  examTimeRemaining: number = 0;
  examTimerInterval: any = null;
  examInProgress: boolean = false;
  examCompleted: boolean = false;
  examScore: number = 0;
  examCorrectAnswers: number = 0;

  // Certification Properties
  userCertifications: Certification[] = [];
  showCertificationModal: boolean = false;
  newCertification: Certification | null = null;
  minimumPassingScore: number = 60; // Configurable passing score

  // Breadcrumb
  breadCrumbItems!: Array<{}>;

  // Reviews
  reviewForm!: UntypedFormGroup;

reviews: Review[] = [];
loadingReviews = false;
currentUserReview: Review | null = null;
  dropzoneConfig: DropzoneConfigInterface = {
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false,
    maxFiles: 5,
    acceptedFiles: 'image/*'
  };
moduleId1:number=0;
  uploadedFiles: any[] = [];
  deleteId: any;
  listchapitre: Chapitre[] = [];

  @ViewChild('addReview', { static: false }) addReview?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;
  @ViewChild('finalExamModal', { static: false }) finalExamModal?: ModalDirective;
  @ViewChild('certificationModal', { static: false }) certificationModal?: ModalDirective;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moduleService: ModuleService,
    private formBuilder: UntypedFormBuilder,
    private fb: FormBuilder,
    private demandeService: DemandeAchatService,
    private apprenantService: ApprenantService,
    private chapitreService: ChapitreService,
    private lessonService: LessonService,
    private sanitizer: DomSanitizer,
    private quizService: QuizService,
    private certificationService: CertificationService,
    private reviewService: ReviewService

  ) {}
/// lksjd psodzo 
  ngOnInit(): void {

this.moduleId1 = this.route.snapshot.params['id'];

  this.loadReviews();


    this.initializeBreadcrumbs();
    this.initializeForms();
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    if (this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
    }
  }

  private initializeBreadcrumbs(): void {
    this.breadCrumbItems = [
      { label: 'Learning', active: false },
      { label: 'Courses', active: false },
      { label: 'Overview', active: true }
    ];
  }



  // ==================== ENHANCED CERTIFICATION METHODS ====================

  private loadUserCertificationsPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.certificationService.getCertificationsByApprenant(this.apprenantId).subscribe({
        next: (certifications) => {
          this.userCertifications = certifications;
          console.log('User certifications loaded:', certifications);
          resolve();
        },
        error: (error) => {
          console.error('Error loading user certifications:', error);
          // Don't reject - certifications are not critical for page loading
          resolve();
        }
      });
    });
  }

  hasModuleCertification(): boolean {
    return this.userCertifications.some(cert => cert.moduleId === this.moduleId);
  }

  getModuleCertification(): Certification | null {
    return this.userCertifications.find(cert => cert.moduleId === this.moduleId) || null;
  }

  // Méthode pour générer manuellement la certification après réussite d'examen
  generateCertificationManually(): void {
    if (!this.hasPassedFinalExam()) {
      Swal.fire({
        icon: 'warning',
        title: 'Examen requis',
        text: 'Vous devez d\'abord réussir l\'examen final pour obtenir votre certification.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.hasModuleCertification()) {
      Swal.fire({
        icon: 'info',
        title: 'Certification déjà obtenue',
        text: 'Vous avez déjà la certification pour ce module.',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Récupérer le score de l'examen depuis le localStorage
    const examResultKey = `exam_result_module_${this.moduleId}`;
    const savedResult = localStorage.getItem(examResultKey);

    if (!savedResult) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de récupérer les résultats de votre examen. Veuillez repasser l\'examen.',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const examResult = JSON.parse(savedResult);

      if (examResult.score >= this.minimumPassingScore) {
        // Afficher une confirmation avant génération
        Swal.fire({
          icon: 'question',
          title: 'Générer la Certification',
          html: `
            <div class="text-center">
              <p>Voulez-vous générer votre certification maintenant ?</p>
              <div class="mt-3">
                <p><strong>Module :</strong> ${this.module?.titre}</p>
                <p><strong>Score obtenu :</strong> ${examResult.score}%</p>
                <p><strong>Date d'examen :</strong> ${new Date(examResult.completedAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Générer la Certification',
          cancelButtonText: 'Annuler',
          confirmButtonColor: '#28a745'
        }).then((result) => {
          if (result.isConfirmed) {
            this.generateCertification(examResult.score);
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Score insuffisant',
          text: `Votre score (${examResult.score}%) est inférieur au minimum requis (${this.minimumPassingScore}%). Veuillez repasser l'examen.`,
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error parsing exam result:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de données',
        text: 'Les données de votre examen sont corrompues. Veuillez repasser l\'examen.',
        confirmButtonText: 'OK'
      });
    }
  }

private generateCertification(examScore: number): void {
  console.log('--- Début generateCertification ---');
  console.log('Module:', this.module);
  console.log('Final Exam:', this.finalExam);
  console.log('Apprenant ID:', this.apprenantId);
  console.log('Module ID:', this.moduleId);

  if (!this.module || !this.finalExam) {
    console.warn('Module ou FinalExam manquant, arrêt de la génération.');
    return;
  }

  // Afficher message de chargement
  Swal.fire({
    title: 'Génération en cours...',
    text: 'Veuillez patienter pendant la génération de votre certification.',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
      console.log('Swal loading ouvert');
    }
  });

  // Création de l'objet certification
  const certification: Certification = {
    titre: `Certification ${this.module.titre}`,
    dateObtention: new Date().toISOString(),
    apprenantId: this.apprenantId,
    score: examScore,
    moduleId: this.moduleId,
    quizId: this.finalExam.id
  };

  console.log('Certification à envoyer au backend:', certification);

  // Sauvegarde côté backend
  this.certificationService.addCertification(certification).subscribe({
    next: (savedCertification) => {
      console.log('Réponse brute du backend:', savedCertification);

      if (!savedCertification) {
        console.error('Backend n’a pas retourné de certification !');
        Swal.close();
        return;
      }

      console.log('Certification générée avec succès:', savedCertification);

      // Fermer le loading dialog
      Swal.close();

      // Mise à jour de la liste locale
      console.log('Avant push, userCertifications:', this.userCertifications);
      this.userCertifications.push(savedCertification);
      console.log('Après push, userCertifications:', this.userCertifications);

      this.newCertification = savedCertification;

      // Afficher message de succès
      this.showCertificationSuccessMessage(savedCertification);
    },
    error: (error) => {
      console.error('Erreur lors de la génération de la certification:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de génération',
        text: 'Une erreur est survenue lors de la génération de votre certification. Veuillez réessayer plus tard.',
        confirmButtonText: 'OK'
      });
    }
  });

  console.log('--- Fin generateCertification ---');
}













  private showCertificationSuccessMessage(certification: Certification): void {
    Swal.fire({
      icon: 'success',
      title: 'Félicitations !',
      html: `
        <div class="text-center">
          <div class="mb-3">
            <i class="fas fa-certificate text-warning" style="font-size: 4rem; animation: rotate 2s linear infinite;"></i>
          </div>
          <h4 class="text-success mb-3">Certification Générée avec Succès !</h4>
          <div class="bg-light p-3 rounded">
            <p class="mb-2"><strong>Module :</strong> ${this.module?.titre}</p>
            <p class="mb-2"><strong>Score :</strong> ${certification.score}%</p>
            <p class="mb-2"><strong>Date :</strong> ${new Date(certification.dateObtention!).toLocaleDateString('fr-FR')}</p>
          </div>
          <div class="mt-4">
            <p class="text-muted">Votre certification est maintenant disponible dans votre profil.</p>
          </div>
        </div>
        <style>
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        </style>
      `,
      confirmButtonText: 'Voir ma Certification',
      showCancelButton: true,
      cancelButtonText: 'Fermer',
      confirmButtonColor: '#28a745',
      customClass: {
        popup: 'swal-certification-success'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.showCertificationDetails(certification);
      }
    });
  }

  showCertificationDetails(certification: Certification): void {
    this.newCertification = certification;
    this.showCertificationModal = true;
  }

  closeCertificationModal(): void {
    this.showCertificationModal = false;
    this.newCertification = null;
  }

  downloadCertification(): void {
    if (!this.newCertification && !this.hasModuleCertification()) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune certification',
        text: 'Vous devez d\'abord obtenir une certification pour pouvoir la télécharger.',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Use the current certification or get from list
    const cert = this.newCertification || this.getModuleCertification();

    if (!cert) return;

    // Show download options
    Swal.fire({
      title: 'Télécharger la Certification',
      html: `
        <div class="text-center">
          <p class="mb-3">Choisissez le format de téléchargement :</p>
          <div class="d-grid gap-2">
            <button class="btn btn-primary" onclick="downloadPDF()">
              <i class="fas fa-file-pdf me-2"></i>Télécharger en PDF
            </button>
            <button class="btn btn-outline-primary" onclick="downloadImage()">
              <i class="fas fa-image me-2"></i>Télécharger en Image
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      didOpen: () => {
        // Add event listeners for download buttons
        (window as any).downloadPDF = () => {
          this.downloadCertificationAsPDF(cert);
          Swal.close();
        };

        (window as any).downloadImage = () => {
          this.downloadCertificationAsImage(cert);
          Swal.close();
        };
      },
      willClose: () => {
        // Clean up global functions
        delete (window as any).downloadPDF;
        delete (window as any).downloadImage;
      }
    });
  }

  private downloadCertificationAsPDF(certification: Certification): void {
    // For now, show a placeholder message
    // In a real implementation, you would generate the PDF on the server or client-side
    Swal.fire({
      icon: 'info',
      title: 'Téléchargement PDF',
      html: `
        <div class="text-center">
          <p>La génération de certificat PDF sera bientôt disponible.</p>
          <div class="mt-3">
            <p><strong>Certification :</strong> ${certification.titre}</p>
            <p><strong>ID :</strong> #${certification.id}</p>
          </div>
        </div>
      `,
      confirmButtonText: 'OK'
    });
  }

  private downloadCertificationAsImage(certification: Certification): void {
    // For now, show a placeholder message
    Swal.fire({
      icon: 'info',
      title: 'Téléchargement Image',
      html: `
        <div class="text-center">
          <p>La génération de certificat image sera bientôt disponible.</p>
          <div class="mt-3">
            <p><strong>Certification :</strong> ${certification.titre}</p>
            <p><strong>ID :</strong> #${certification.id}</p>
          </div>
        </div>
      `,
      confirmButtonText: 'OK'
    });
  }

  viewAllCertifications(): void {
    // Check if we have certifications to show
    if (this.userCertifications.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Aucune certification',
        text: 'Vous n\'avez pas encore de certification. Terminez des modules pour en obtenir !',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Navigate to certifications page or show modal with all certifications
    this.router.navigate(['/learning/certifications']);
  }

  // ==================== ENHANCED EXAM METHODS ====================

  // ==================== ENHANCED FINAL EXAM METHODS ====================

  private finalizeFinalExam(): void {
    if (!this.finalExam || !this.examInProgress) return;

    // Stop timer
    if (this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
      this.examTimerInterval = null;
    }

    this.examInProgress = false;
    this.examCompleted = true;

    // Calculate score
    this.examCorrectAnswers = 0;
    this.finalExam.questions.forEach(question => {
      const selectedOptionId = this.selectedAnswers[question.id];
      if (selectedOptionId) {
        const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
        if (selectedOption && selectedOption.correct) {
          this.examCorrectAnswers++;
        }
      }
    });

    this.examScore = Math.round((this.examCorrectAnswers / this.totalQuestions) * 100);

    // Save exam result
    this.saveExamResult();

    // Check if certification should be generated
    if (this.examScore >= this.minimumPassingScore && !this.hasModuleCertification()) {
      // Delay certification generation slightly to ensure exam modal is fully displayed
      setTimeout(() => {
        this.generateCertification(this.examScore);
      }, 1000);
    }
  }

  private saveExamResult(): void {
    const examResultKey = `exam_result_module_${this.moduleId}`;
    const examResult = {
      moduleId: this.moduleId,
      score: this.examScore,
      correctAnswers: this.examCorrectAnswers,
      totalQuestions: this.totalQuestions,
      completedAt: new Date().toISOString(),
      duration: this.examDuration,
      timeUsed: this.examDuration - Math.floor(this.examTimeRemaining / 60),
      passed: this.examScore >= this.minimumPassingScore
    };

    localStorage.setItem(examResultKey, JSON.stringify(examResult));
  }

  hasPassedFinalExam(): boolean {
    const examResultKey = `exam_result_module_${this.moduleId}`;
    const savedResult = localStorage.getItem(examResultKey);
    if (savedResult) {
      try {
        const result = JSON.parse(savedResult);
        return result.score >= this.minimumPassingScore;
      } catch {
        return false;
      }
    }
    return false;
  }

  getExamScoreMessage(): string {
    if (this.examScore >= 80) return 'Félicitations ! Excellent résultat !';
    if (this.examScore >= this.minimumPassingScore) return 'Félicitations ! Vous avez réussi l\'examen !';
    return `Vous devez obtenir au moins ${this.minimumPassingScore}% pour réussir l\'examen.`;
  }

  // ==================== UI HELPER METHODS ====================

 canTakeExam(): boolean {
  const userRole = localStorage.getItem('role') || '';
  
  // ✅ Les formateurs ont toujours accès à l'examen (mais pas besoin de le passer)
  if (userRole === 'FORMATEUR' || userRole === 'ROLE_FORMATEUR') {
    return this.finalExam !== null;
  }
  
  // ✅ Les apprenants doivent avoir acheté le module et ne pas avoir déjà réussi
  return this.canAccess && this.finalExam !== null && !this.hasPassedFinalExam();
}

  getExamStatusMessage(): string {
    if (!this.canAccess) return 'Module non acheté';
    if (!this.finalExam) return 'Examen non disponible';
    if (this.hasPassedFinalExam()) return 'Examen réussi';
    return 'Examen disponible';
  }

  getCertificationStatusMessage(): string {
    if (!this.canAccess) return 'Achetez le module pour accéder à la certification';
    if (!this.finalExam) return 'Examen final requis pour la certification';
    if (this.hasModuleCertification()) return 'Certification obtenue';
    if (this.hasPassedFinalExam()) return 'Certification en cours de génération...';
    return `Réussissez l'examen final (${this.minimumPassingScore}% minimum) pour obtenir votre certification`;
  }

  getCertificationStatusClass(): string {
    if (this.hasModuleCertification()) return 'text-success';
    if (this.canTakeExam()) return 'text-primary';
    if (!this.canAccess) return 'text-warning';
    return 'text-muted';
  }

  // ==================== EXISTING METHODS (keeping all original functionality) ====================

  private checkAccessPromise(moduleId: number, apprenantId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.moduleService.getAcceptedModules(apprenantId).subscribe({
        next: (modules) => {
          this.canAccess = modules.some(m => m.id === moduleId);
          console.log('Access check result:', this.canAccess);
          resolve();
        },
        error: (err) => {
          console.error('Error checking access:', err);
          this.canAccess = false;
          reject(err);
        }
      });
    });
  }

  private loadAccessibleContent(): void {
    console.log('Loading full accessible content for purchased module');
    this.getAllChapitre();
    this.loadQuizProgress();
    this.loadFinalExam();
  }

  private loadPreviewContent(): void {
    console.log('Loading preview content for non-purchased module');
    this.getAllChapitrePreview();
  }

  private loadFinalExam(): void {
 console.log('moduleId:', this.moduleId);

  this.quizService.getquizbymoduleid(this.moduleId).subscribe({
    next: (exam) => {
      console.log('Raw exam response:', exam);

      if (exam) {  // exam est un objet unique
        this.finalExam = exam;
        console.log('Final exam loaded:', this.finalExam);
      } else {
        console.warn('No exam found for module', this.moduleId);
      }
    },
    error: (error) => {
      console.error('Error loading final exam:', error);
    }
  });
  }

  startFinalExam(): void {
    if (!this.canAccess) {
      this.showAccessDeniedMessage('exam');
      return;
    }

    if (this.hasPassedFinalExam()) {
      Swal.fire({
        icon: 'info',
        title: 'Examen déjà réussi',
        text: 'Vous avez déjà réussi l\'examen final pour ce module.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!this.finalExam || !this.finalExam.questions || this.finalExam.questions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Examen non disponible',
        text: 'L\'examen final n\'est pas encore configuré pour ce module.',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Show confirmation dialog with certification info
    Swal.fire({
      icon: 'question',
      title: 'Commencer l\'Examen Final',
      html: `
        <div class="text-start">
          <p><strong>Instructions importantes :</strong></p>
          <ul class="text-start">
            <li>Durée : ${this.examDuration} minutes</li>
            <li>Questions : ${this.finalExam.questions.length}</li>
            <li>Note minimum : ${this.minimumPassingScore}%</li>
            <li>Une seule tentative autorisée</li>
            <li>Vous ne pouvez pas revenir en arrière</li>
            <li>L'examen se ferme automatiquement à la fin du temps</li>
          </ul>
          <div class="alert alert-info">
            <i class="fas fa-certificate me-2"></i>
            <strong>Certification automatique :</strong> Si vous obtenez ${this.minimumPassingScore}% ou plus,
            vous recevrez automatiquement votre certification !
          </div>
          <p class="text-warning"><i class="fas fa-exclamation-triangle"></i> Assurez-vous d'avoir une connexion stable.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Commencer l\'Examen',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.initializeFinalExam();
      }
    });
  }

  private initializeFinalExam(): void {
    // Reset exam state
    this.examInProgress = true;
    this.examCompleted = false;
    this.currentQuestionIndex = 0;
    this.totalQuestions = this.finalExam!.questions.length;
    this.currentQuestion = this.finalExam!.questions[0];
    this.selectedAnswers = {};
    this.examScore = 0;
    this.examCorrectAnswers = 0;

    // Set timer
    this.examStartTime = new Date();
    this.examTimeRemaining = this.examDuration * 60; // Convert to seconds

    // Show modal
    this.showFinalExamModal = true;

    // Start countdown timer
    this.startExamTimer();
  }

  private startExamTimer(): void {
    this.examTimerInterval = setInterval(() => {
      this.examTimeRemaining--;

      if (this.examTimeRemaining <= 0) {
        this.finalizeFinalExam();
      }
    }, 1000);
  }

  getExamTimeFormatted(): string {
    const minutes = Math.floor(this.examTimeRemaining / 60);
    const seconds = this.examTimeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getExamTimeClass(): string {
    if (this.examTimeRemaining <= 300) return 'text-danger'; // Last 5 minutes
    if (this.examTimeRemaining <= 600) return 'text-warning'; // Last 10 minutes
    return 'text-primary';
  }

  selectExamAnswer(optionId: number): void {
    if (this.currentQuestion && this.examInProgress) {
      this.selectedAnswers[this.currentQuestion.id] = optionId;
    }
  }

  nextExamQuestion(): void {
    if (!this.finalExam || !this.currentQuestion || !this.examInProgress) return;

    // Check if answer is selected for current question
    if (!this.selectedAnswers[this.currentQuestion.id]) {
      Swal.fire({
        icon: 'warning',
        title: 'Réponse requise',
        text: 'Veuillez sélectionner une réponse avant de continuer.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isLastExamQuestion()) {
      this.finalizeFinalExam();
    } else {
      this.currentQuestionIndex++;
      this.currentQuestion = this.finalExam.questions[this.currentQuestionIndex];
    }
  }

  isLastExamQuestion(): boolean {
    return this.currentQuestionIndex === this.totalQuestions - 1;
  }

  getExamProgress(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.totalQuestions) * 100);
  }

  getExamScoreClass(): string {
    if (this.examScore >= 80) return 'text-success';
    if (this.examScore >= this.minimumPassingScore) return 'text-success';
    return 'text-danger';
  }

  closeFinalExamModal(): void {
    if (this.examInProgress) {
      Swal.fire({
        icon: 'warning',
        title: 'Examen en cours',
        text: 'Êtes-vous sûr de vouloir fermer l\'examen ? Vos réponses seront perdues.',
        showCancelButton: true,
        confirmButtonText: 'Fermer l\'examen',
        cancelButtonText: 'Continuer l\'examen',
        confirmButtonColor: '#dc3545'
      }).then((result) => {
        if (result.isConfirmed) {
          this.forceCloseExam();
        }
      });
      return;
    }

    this.resetExamState();
  }

  private forceCloseExam(): void {
    if (this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
      this.examTimerInterval = null;
    }
    this.resetExamState();
  }

  private resetExamState(): void {
    this.showFinalExamModal = false;
    this.examInProgress = false;
    this.examCompleted = false;
    this.currentQuestion = null;
    this.currentQuestionIndex = 0;
    this.totalQuestions = 0;
    this.selectedAnswers = {};
    this.examScore = 0;
    this.examCorrectAnswers = 0;
    this.examStartTime = null;
    this.examTimeRemaining = 0;
  }

  // All other existing methods remain unchanged...
  // (Including video management, quiz management, access control, etc.)

  private loadModuleDataPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.moduleService.getModuleByid(this.moduleId).subscribe({
        next: (data) => {
          this.module = data;
          this.demande.moduleId = data.id;
          this.demande.moduleTitre = data.titre;
          this.demande.prixFinal = data.prixInitial;
          console.log('Module loaded:', data);
          resolve();
        },
        error: (error) => {
          console.error('Error loading module:', error);
          reject(error);
        }
      });
    });
  }

  private getApprenantByidPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      const apprenantId = +localStorage.getItem('userId')!;
      this.apprenantService.getApprenantByid(apprenantId).subscribe({
        next: (data) => {
          this.apprenant = data;
          this.demande.apprenant = data;
          this.demande.apprenantId = data.id;
          this.demande.apprenantNom = data.firstName + ' ' + data.lastName;
          this.demande.apprenantEmail = data.email;
          this.demande.phone = data.phone;
          this.demande.adress = data.adress;
          console.log('Apprenant loaded:', data);
          resolve();
        },
        error: (error) => {
          console.error('Error loading apprenant:', error);
          reject(error);
        }
      });
    });
  }

  private handleError(): void {
    this.loading = false;
    this.error = true;
    this.accessCheckComplete = true;
  }

  // Include all other existing methods (video, quiz, navigation, etc.)
  // ... (rest of the existing methods remain the same)

  getAllChapitre() {
    this.chapitreService.getChapitresByModuleId(this.moduleId1).subscribe({
      next: (data) => {
        this.listchapitre = data;
        console.log("list chapitre ", data);
        this.loadLessonsForAllChapters();
        this.loadAllChapterQuizzes();
      },
      error: (error) => {
        console.error('Error loading chapters:', error);
      }
    });
  }

  loadLessonsForAllChapters(): void {
    this.listchapitre.forEach((chapitre, index) => {
      if (chapitre.id) {
        this.loadLessonsForChapter(chapitre.id, index);
      }
    });
  }

  loadLessonsForChapter(chapitreId: number, chapitreIndex: number): void {
    this.lessonService.getLessonsByChapitre(chapitreId).subscribe({
      next: (lessons: Lesson[]) => {
        const sortedLessons = lessons.sort((a, b) => a.ordre - b.ordre);
        this.listchapitre[chapitreIndex].lessons = sortedLessons;
        console.log(`${sortedLessons.length} lessons loaded for chapter ${chapitreId}`);
      },
      error: (error) => {
        console.error(`Error loading lessons for chapter ${chapitreId}:`, error);
        this.listchapitre[chapitreIndex].lessons = [];
      }
    });
  }

  loadAllChapterQuizzes(): void {
    if (!this.canAccess) return;

    this.listchapitre.forEach(chapitre => {
      if (chapitre.id) {
        this.loadChapterQuiz(chapitre.id);
      }
    });
  }

  loadChapterQuiz(chapitreId: number): void {
    this.quizService.getQuizzeByChapitreId(chapitreId).subscribe({
      next: (quizzes) => {
        if (quizzes && quizzes.length > 0) {
          this.chapterQuizzes.set(chapitreId, quizzes[0]);
          console.log(`Quiz loaded for chapter ${chapitreId}:`, quizzes[0]);
        }
      },
      error: (error) => {
        console.error(`Error loading quiz for chapter ${chapitreId}:`, error);
      }
    });
  }

  getChapterQuiz(chapitreId: number): QuizResponseDto | null {
    return this.chapterQuizzes.get(chapitreId) || null;
  }

  isQuizCompleted(chapitreId: number): boolean {
    return this.completedQuizzes.has(chapitreId);
  }

  // Quiz interaction methods
  selectAnswer(optionId: number): void {
    if (this.currentQuestion) {
      this.selectedAnswers[this.currentQuestion.id] = optionId;
    }
  }

  nextQuestion(): void {
    if (!this.completedQuiz || !this.currentQuestion) return;

    if (this.isLastQuestion()) {
      this.finishQuiz();
    } else {
      this.currentQuestionIndex++;
      this.currentQuestion = this.completedQuiz.questions[this.currentQuestionIndex];
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0 && this.completedQuiz) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.completedQuiz.questions[this.currentQuestionIndex];
    }
  }

  isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.totalQuestions - 1;
  }

  getQuizProgress(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.totalQuestions) * 100);
  }

  finishQuiz(): void {
    if (!this.completedQuiz || !this.activeQuizId) return;

    this.correctAnswers = 0;

    this.completedQuiz.questions.forEach(question => {
      const selectedOptionId = this.selectedAnswers[question.id];
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);

      if (selectedOption && selectedOption.correct) {
        this.correctAnswers++;
      }
    });

    this.quizScore = Math.round((this.correctAnswers / this.totalQuestions) * 100);
    this.showQuizResults = true;
    this.completedQuizzes.add(this.activeQuizId);
    this.saveQuizProgress();
  }

  getScoreClass(): string {
    if (this.quizScore >= 80) return 'text-success';
    if (this.quizScore >= 60) return 'text-warning';
    return 'text-danger';
  }

  getScoreMessage(): string {
    if (this.quizScore >= 80) return 'Excellent travail !';
    if (this.quizScore >= 60) return 'Bon travail !';
    return 'Continuez vos efforts !';
  }

  retakeQuiz(chapitreId: number): void {
    this.completedQuizzes.delete(chapitreId);
    this.startQuiz(chapitreId);
  }

  closeQuiz(): void {
    this.activeQuizId = null;
    this.currentQuestion = null;
    this.currentQuestionIndex = 0;
    this.totalQuestions = 0;
    this.selectedAnswers = {};
    this.showQuizResults = false;
    this.completedQuiz = null;
    this.quizScore = 0;
    this.correctAnswers = 0;
  }

  saveQuizProgress(): void {
    const progressKey = `quiz_progress_module_${this.moduleId}`;
    const progress = Array.from(this.completedQuizzes);
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }

  loadQuizProgress(): void {
    const progressKey = `quiz_progress_module_${this.moduleId}`;
    const savedProgress = localStorage.getItem(progressKey);

    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        this.completedQuizzes = new Set(progress);
      } catch (error) {
        console.error('Error loading quiz progress:', error);
      }
    }
  }

  // Video and lesson methods





  playLesson(lesson: Lesson, chapter: Chapitre): void {
    if (!this.canAccess) {
      this.showAccessDeniedMessage('video');
      return;
    }

    this.currentLesson = lesson;
    this.selectedChapter = chapter;
    this.isWatchingLesson = true;
    this.currentVideoTitle = `${chapter.titre} - ${lesson.titre}`;

    this.breadCrumbItems = [
      { label: 'Learning', active: false },
      { label: 'Courses', active: false },
      { label: this.module?.titre || 'Overview', active: false },
      { label: lesson.titre, active: true }
    ];

    console.log('Playing lesson:', lesson);
  }

  startQuiz(chapitreId: number): void {
    if (!this.canAccess) {
      this.showAccessDeniedMessage('quiz');
      return;
    }

    const quiz = this.getChapterQuiz(chapitreId);
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Quiz non disponible',
        text: 'Ce chapitre n\'a pas de quiz ou le quiz n\'est pas encore configuré.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.activeQuizId = chapitreId;
    this.completedQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.totalQuestions = quiz.questions.length;
    this.currentQuestion = quiz.questions[0];
    this.selectedAnswers = {};
    this.showQuizResults = false;
    this.quizScore = 0;
    this.correctAnswers = 0;

    console.log('Quiz started:', quiz);
  }

  showAccessDeniedMessage(feature: string): void {
    let message = '';
    let title = 'Accès Restreint';

    switch (feature) {
      case 'video':
        title = 'Vidéos Verrouillées';
        message = 'Vous devez acheter ce module pour accéder aux vidéos.';
        break;
      case 'quiz':
        title = 'Quiz Verrouillé';
        message = 'Vous devez acheter ce module pour accéder aux quiz.';
        break;
      case 'exam':
        title = 'Examen Verrouillé';
        message = 'Vous devez acheter ce module pour passer l\'examen final.';
        break;
      default:
        message = 'Vous devez acheter ce module pour accéder à cette fonctionnalité.';
    }

    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Acheter le Module',
      cancelButtonText: 'Plus tard'
    }).then((result) => {
      if (result.isConfirmed) {
        this.openModal();
      }
    });
  }

  // UI helper methods
  canWatchVideo(lesson: Lesson): boolean {
    return this.canAccess && this.hasVideoContent(lesson);
  }

 canTakeQuiz(chapitreId: number): boolean {
  const userRole = localStorage.getItem('role') || '';
  
  // ✅ Les formateurs ont toujours accès aux quiz
  if (userRole === 'FORMATEUR' || userRole === 'ROLE_FORMATEUR') {
    return this.getChapterQuiz(chapitreId) !== null;
  }
  
  // ✅ Les apprenants doivent avoir acheté le module
  return this.canAccess && this.getChapterQuiz(chapitreId) !== null;
}

  getAccessStatusMessage(): string {
    return this.canAccess ?
      'Module acheté - Accès complet' :
      'Aperçu gratuit - Achetez pour un accès complet';
  }

  getAccessStatusClass(): string {
    return this.canAccess ? 'text-success' : 'text-warning';
  }

  // Navigation methods
  backToModuleOverview(): void {
    this.isWatchingLesson = false;
    this.currentLesson = null;
    this.selectedChapter = null;
    this.currentVideoTitle = '';

    this.breadCrumbItems = [
      { label: 'Learning', active: false },
      { label: 'Courses', active: false },
      { label: this.module?.titre || 'Overview', active: true }
    ];
  }

  getCurrentVideoTitle(): string {
    if (this.isWatchingLesson && this.currentLesson && this.selectedChapter) {
      return `${this.selectedChapter.titre} - ${this.currentLesson.titre}`;
    }
    return this.module?.titre || 'Course Video';
  }

  hasVideoContent(lesson: Lesson): boolean {
    return typeof lesson.contenu === 'string' && lesson.contenu.trim() !== '';
  }

  getLessonDuration(lesson: Lesson): string {
    return lesson.duree || '00:00';
  }

  getTotalLessonsCount(): number {
    return this.listchapitre.reduce((total, chapitre) => {
      return total + (chapitre.lessons?.length || 0);
    }, 0);
  }

  getNextLesson(): Lesson | null {
    if (!this.currentLesson || !this.selectedChapter) return null;

    const currentChapterIndex = this.listchapitre.findIndex(c => c.id === this.selectedChapter!.id);
    const currentLessonIndex = this.selectedChapter.lessons?.findIndex(l => l.id === this.currentLesson!.id) || -1;

    if (currentLessonIndex < (this.selectedChapter.lessons?.length || 0) - 1) {
      return this.selectedChapter.lessons![currentLessonIndex + 1];
    }

    if (currentChapterIndex < this.listchapitre.length - 1) {
      const nextChapter = this.listchapitre[currentChapterIndex + 1];
      return nextChapter.lessons && nextChapter.lessons.length > 0 ? nextChapter.lessons[0] : null;
    }

    return null;
  }

  getPreviousLesson(): Lesson | null {
    if (!this.currentLesson || !this.selectedChapter) return null;

    const currentChapterIndex = this.listchapitre.findIndex(c => c.id === this.selectedChapter!.id);
    const currentLessonIndex = this.selectedChapter.lessons?.findIndex(l => l.id === this.currentLesson!.id) || -1;

    if (currentLessonIndex > 0) {
      return this.selectedChapter.lessons![currentLessonIndex - 1];
    }

    if (currentChapterIndex > 0) {
      const prevChapter = this.listchapitre[currentChapterIndex - 1];
      return prevChapter.lessons && prevChapter.lessons.length > 0
        ? prevChapter.lessons[prevChapter.lessons.length - 1]
        : null;
    }

    return null;
  }

  playNextLesson(): void {
    const nextLesson = this.getNextLesson();
    if (nextLesson) {
      const chapter = this.listchapitre.find(c =>
        c.lessons?.some(l => l.id === nextLesson.id)
      );
      if (chapter) {
        this.playLesson(nextLesson, chapter);
      }
    }
  }

  playPreviousLesson(): void {
    const prevLesson = this.getPreviousLesson();
    if (prevLesson) {
      const chapter = this.listchapitre.find(c =>
        c.lessons?.some(l => l.id === prevLesson.id)
      );
      if (chapter) {
        this.playLesson(prevLesson, chapter);
      }
    }
  }

  changeTab(tab: string): void {
    this.currentTab = tab;
    if (tab !== 'videoTutorials') {
      this.backToModuleOverview();
    }
  }

  // Purchase and module info methods
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }



  getImageUrl(): string {
    if (!this.module?.image || this.module.image.trim() === '') {
      return 'assets/images/learning/react.png';
    }

    if (this.module.image.startsWith('http')) {
      return this.module.image;
    }

    return `${environment.baseUrl}/uploads/images/${this.module.image}`;
  }

  getFinalPrice(): number {
    if (!this.module) return 0;

    if (this.module.discount && this.module.discount > 0) {
      return this.module.prixInitial - (this.module.prixInitial * this.module.discount / 100);
    }

    return this.module.prixInitial;
  }

  getOriginalPrice(): number {
    return this.module?.prixInitial || 0;
  }

  hasDiscount(): boolean {
    return this.module?.discount !== undefined && this.module.discount > 0;
  }

  getDiscountPercentage(): number {
    return this.module?.discount || 0;
  }

  getLevelBadgeClass(): string {
    if (!this.module?.level) return 'bg-secondary-subtle text-secondary';

    switch (this.module.level) {
      case Level.BEGINNER:
        return 'bg-success-subtle text-success';
      case Level.INTERMEDIATE:
        return 'bg-warning-subtle text-warning';
      case Level.ADVENCED:
        return 'bg-danger-subtle text-danger';
      case Level.ALL_LEVEL:
        return 'bg-info-subtle text-info';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  // Review methods




  removeReview(index: number): void {
    if (!this.canAccess) {
      this.showAccessDeniedMessage('review');
      return;
    }

    this.deleteId = index;
    this.removeItemModal?.show();
  }


  onUploadSuccess(file: any): void {
    this.uploadedFiles.push(file);
  }

  removeFile(file: any): void {
    const index = this.uploadedFiles.indexOf(file);
    if (index > -1) {
      this.uploadedFiles.splice(index, 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/learning/courses/grid']);
  }

  // Additional utility methods
  private getAllChapitrePreview(): void {
    this.chapitreService.getChapitresByModuleId(this.moduleId).subscribe({
      next: (data) => {
        this.listchapitre = data;
        if (data.length > 0 && data[0].id) {
          this.loadPreviewLessons(data[0].id, 0);
        }
      },
      error: (error) => {
        console.error('Error loading chapters preview:', error);
      }
    });
  }

  private loadPreviewLessons(chapitreId: number, chapitreIndex: number): void {
    this.lessonService.getLessonsByChapitre(chapitreId).subscribe({
      next: (lessons: Lesson[]) => {
        const previewLessons = lessons.sort((a, b) => a.ordre - b.ordre).slice(0, 1);
        this.listchapitre[chapitreIndex].lessons = previewLessons;
        console.log('Preview lessons loaded:', previewLessons);
      },
      error: (error) => {
        console.error('Error loading preview lessons:', error);
        this.listchapitre[chapitreIndex].lessons = [];
      }
    });
  }

  isYoutube(url: any): boolean {
    if (!url) return false;
    const urlString = url.changingThisBreaksApplicationSecurity || url.toString();
    return urlString.includes('youtube.com/embed') || urlString.includes('youtu.be/');
  }

  transform(url: any): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  refreshChapterLessons(chapitreId: number): void {
    const chapitreIndex = this.listchapitre.findIndex(c => c.id === chapitreId);
    if (chapitreIndex !== -1) {
      this.loadLessonsForChapter(chapitreId, chapitreIndex);
    }
  }

  hasLoadedLessons(chapitre: Chapitre): boolean {
    return chapitre.lessons !== undefined && chapitre.lessons !== null;
  }

  getVideoLessonsCount(chapitre: Chapitre): number {
    if (!chapitre.lessons) return 0;
    return chapitre.lessons.filter(lesson => this.hasVideoContent(lesson)).length;
  }

  areAllLessonsLoaded(): boolean {
    return this.listchapitre.every(chapitre => this.hasLoadedLessons(chapitre));
  }

  getTotalVideoLessonsCount(): number {
    return this.listchapitre.reduce((total, chapitre) => {
      return total + this.getVideoLessonsCount(chapitre);
    }, 0);
  }

  openchatbox(): void {
    const chatElement = document.getElementById('emailchat-detailElem');
    if (chatElement) {
      chatElement.classList.add('show');
    }
  }

  closechatbox(): void {
    const chatElement = document.getElementById('emailchat-detailElem');
    if (chatElement) {
      chatElement.classList.remove('show');
    }
  }

  loadModuleData(): void {
    this.loadModuleDataPromise().then(() => {
      console.log('Module data reloaded');
    }).catch(error => {
      console.error('Error reloading module data:', error);
    });
  }

///////////////



private initializeForms(): void {
  this.reviewForm = this.formBuilder.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    commentaire: ['', [Validators.required, Validators.minLength(10)]]
  });

  this.demande.dateDemande = new Date().toISOString().split('T')[0];
  this.demande.statut = 'EN_ATTENTE';
}

// Charger les reviews du module


// Sauvegarder un nouveau review
saveReview(): void {
  if (!this.canAccess) {
    this.showAccessDeniedMessage('review');
    return;
  }

  if (!this.reviewForm.valid) {
    Swal.fire({
      icon: 'warning',
      title: 'Formulaire invalide',
      text: 'Veuillez remplir tous les champs requis.',
      confirmButtonText: 'OK'
    });
    return;
  }

  // Vérifier si l'utilisateur a déjà laissé un avis
  if (this.currentUserReview) {
    Swal.fire({
      icon: 'question',
      title: 'Modifier votre avis ?',
      text: 'Vous avez déjà laissé un avis. Voulez-vous le modifier ?',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateExistingReview();
      }
    });
    return;
  }

  const newReview: Review = {
    id: 0,
    commentaire: this.reviewForm.get('commentaire')?.value,
    rating: this.reviewForm.get('rating')?.value,
    date: new Date().toISOString().slice(0, 19),

    apprenantId: this.apprenantId,
    apprenantName: `${this.apprenant.firstName} ${this.apprenant.lastName}`,
    moduleId: this.moduleId,
    moduleName: this.module?.titre,
    visible: true
  };

  this.reviewService.addReview(newReview).subscribe({
    next: (savedReview) => {
      Swal.fire({
        icon: 'success',
        title: 'Avis ajouté',
        text: 'Votre avis a été publié avec succès !',
        timer: 2000,
        showConfirmButton: false
      });

      this.reviews.unshift(savedReview);
      this.currentUserReview = savedReview;
      this.addReview?.hide();
      this.reviewForm.reset({ rating: 5, commentaire: '' });
    },
    error: (error) => {
      console.error('Error adding review:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'ajout de votre avis.',
        confirmButtonText: 'OK'
      });
    }
  });
}

// Modifier un avis existant
updateExistingReview(): void {
  if (!this.currentUserReview) return;

  const updatedReview: Review = {
    ...this.currentUserReview,
    commentaire: this.reviewForm.get('commentaire')?.value,
    rating: this.reviewForm.get('rating')?.value,
    date: new Date().toISOString()
  };

  this.reviewService.updateReview(this.currentUserReview.id, updatedReview).subscribe({
    next: (updated) => {
      Swal.fire({
        icon: 'success',
        title: 'Avis modifié',
        text: 'Votre avis a été mis à jour avec succès !',
        timer: 2000,
        showConfirmButton: false
      });

      // Mettre à jour dans la liste
      const index = this.reviews.findIndex(r => r.id === updated.id);
      if (index !== -1) {
        this.reviews[index] = updated;
      }
      this.currentUserReview = updated;
      this.addReview?.hide();
      this.reviewForm.reset({ rating: 5, commentaire: '' });
    },
    error: (error) => {
      console.error('Error updating review:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la mise à jour de votre avis.',
        confirmButtonText: 'OK'
      });
    }
  });
}

// Éditer son propre avis
editMyReview(): void {
  if (!this.canAccess) {
    this.showAccessDeniedMessage('review');
    return;
  }

  if (!this.currentUserReview) return;

  this.reviewForm.patchValue({
    rating: this.currentUserReview.rating,
    commentaire: this.currentUserReview.commentaire
  });

  this.addReview?.show();
}

// Supprimer son propre avis
deleteMyReview(): void {
  if (!this.canAccess || !this.currentUserReview) return;

  Swal.fire({
    icon: 'warning',
    title: 'Confirmer la suppression',
    text: 'Êtes-vous sûr de vouloir supprimer votre avis ?',
    showCancelButton: true,
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#dc3545'
  }).then((result) => {
    if (result.isConfirmed && this.currentUserReview) {
      this.reviewService.deleteReview(this.currentUserReview.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Avis supprimé',
            text: 'Votre avis a été supprimé avec succès.',
            timer: 2000,
            showConfirmButton: false
          });

          // Retirer de la liste
          this.reviews = this.reviews.filter(r => r.id !== this.currentUserReview!.id);
          this.currentUserReview = null;
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la suppression de votre avis.',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  });
}

// Calculer la note moyenne
getAverageRating(): number {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
}

// Obtenir le nombre d'étoiles pour chaque niveau
getRatingCount(rating: number): number {
  return this.reviews.filter(r => r.rating === rating).length;
}

// Obtenir le pourcentage pour chaque niveau d'étoiles
getRatingPercentage(rating: number): number {
  if (this.reviews.length === 0) return 0;
  return Math.round((this.getRatingCount(rating) / this.reviews.length) * 100);
}

// Formater la date
formatReviewDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Aujourd\'hui';
  if (diffInDays === 1) return 'Hier';
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;

  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Générer un tableau d'étoiles pour l'affichage
getStarsArray(rating: number): boolean[] {
  return Array(5)
    .fill(false)
    .map((_, index) => index < rating);
}











// Remplacer dans overview.component.ts

// Méthode corrigée pour initialiser le composant
private initializeComponent(): void {
  this.route.params.subscribe(params => {
    this.moduleId = +params['id'];

    const userId = +localStorage.getItem('userId')!;
    const userRole = localStorage.getItem('role') || '';

    this.apprenantId = userId;

    if (this.moduleId && userId) {
      // Si c'est un formateur, donner accès complet automatiquement
      if (userRole === 'FORMATEUR' || userRole === 'ROLE_FORMATEUR') {
        this.canAccess = true;
        this.loadComponentDataForFormateur(userId);
      } else if (userRole === 'APPRENANT' || userRole === 'ROLE_APPRENANT') {
        this.loadComponentData(userId);
      } else {
        console.error('Unknown user role:', userRole);
        this.handleError();
      }
    } else {
      console.error('Missing module ID or user ID');
      this.handleError();
    }
  });
}

// Nouvelle méthode pour charger les données du formateur
private loadComponentDataForFormateur(formateurId: number): void {
  this.loading = true;

  // Charger uniquement les données du module pour le formateur
  Promise.all([
    this.loadModuleDataPromise(),
    this.loadUserCertificationsPromise()
  ]).then(() => {
    this.accessCheckComplete = true;
    this.loading = false;

    // Créer un objet apprenant fictif pour éviter les erreurs
    this.apprenant = {
      id: formateurId,
      firstName: 'Formateur',
      lastName: '',
      email: localStorage.getItem('userEmail') || '',
      phone: '',
      adress: ''
    } as Apprenant;

    // Charger le contenu complet
    this.loadAccessibleContent();
  }).catch(error => {
    console.error('Error loading formateur data:', error);
    this.handleError();
  });
}

// Méthode existante modifiée pour les apprenants
private loadComponentData(apprenantId: number): void {
  this.loading = true;

  // Load all required data
  Promise.all([
    this.checkAccessPromise(this.moduleId, apprenantId),
    this.loadModuleDataPromise(),
    this.getApprenantByidPromise(),
    this.loadUserCertificationsPromise()
  ]).then(() => {
    this.accessCheckComplete = true;
    this.loading = false;

    // Load additional data based on access level
    if (this.canAccess) {
      this.loadAccessibleContent();
    } else {
      this.loadPreviewContent();
    }
  }).catch(error => {
    console.error('Error loading component data:', error);
    this.handleError();
  });
}

// Modifier la méthode loadReviews pour supporter les formateurs
loadReviews(): void {
  if (!this.moduleId1) return;
  console.log('Loading reviews for module ID:', this.moduleId1);
  this.loadingReviews = true;

  this.reviewService.getReviewsByModule(this.moduleId1).subscribe({
    next: (reviews) => {
      this.reviews = reviews.filter(r => r.visible);
      this.reviewTotal = reviews.length;

      // Trouver si l'utilisateur actuel a déjà laissé un avis
      // Seulement pour les apprenants
      const userRole = localStorage.getItem('role') || '';
      if (this.apprenantId && (userRole === 'APPRENANT' || userRole === 'ROLE_APPRENANT')) {
        this.currentUserReview = reviews.find(r => r.apprenantId === this.apprenantId) || null;
      }

      console.log('Reviews loaded:', reviews);
      this.loadingReviews = false;
    },
    error: (error) => {
      console.error('Error loading reviews:', error);
      this.reviews = [];
      this.loadingReviews = false;
    }
  });
}

// Modifier canLeaveReview pour les formateurs
canLeaveReview(): boolean {
  const userRole = localStorage.getItem('role') || '';
  // Les formateurs ne peuvent pas laisser d'avis
  if (userRole === 'FORMATEUR' || userRole === 'ROLE_FORMATEUR') {
    return false;
  }
  return this.canAccess && !this.currentUserReview;
}

// Modifier getReviewButtonText
getReviewButtonText(): string {
  const userRole = localStorage.getItem('role') || '';

  if (userRole === 'FORMATEUR' || userRole === 'ROLE_FORMATEUR') {
    return 'Voir les avis';
  }

  if (!this.canAccess) return 'Acheter pour laisser un avis';
  if (this.currentUserReview) return 'Modifier mon avis';
  return 'Ajouter un avis';
}

// Modifier openReviewModal pour bloquer les formateurs
openReviewModal(): void {
  const userRole = localStorage.getItem('role') || '';

  if (userRole === 'FORMATEUR' || userRole === 'ROLE_FORMATEUR') {
    Swal.fire({
      icon: 'info',
      title: 'Accès restreint',
      text: 'Les formateurs ne peuvent pas laisser d\'avis sur les modules.',
      confirmButtonText: 'OK'
    });
    return;
  }

  if (!this.canAccess) {
    this.showAccessDeniedMessage('review');
    return;
  }

  if (this.currentUserReview) {
    this.editMyReview();
  } else {
    this.reviewForm.reset({ rating: 5, commentaire: '' });
    this.addReview?.show();
  }
}

// Modifier submitDemande pour supporter les formateurs
submitDemande() {
  const userRole = localStorage.getItem('role') || '';

  if (userRole === 'FORMATEUR' || userRole === 'ROLE_FORMATEUR') {
    Swal.fire({
      icon: 'info',
      title: 'Accès formateur',
      text: 'En tant que formateur, vous avez déjà accès complet à ce module.',
      confirmButtonText: 'OK'
    });
    this.closeModal();
    return;
  }

  this.demandeService.addDemandeAchat(this.demande).subscribe(() => {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Votre demande a été envoyée avec succès !',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showModal = false;
        this.router.navigate(['/learning/courses/grid']);
      }
    });
  }, error => {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Une erreur est survenue lors de l\'envoi.',
      confirmButtonText: 'OK'
    });
  });
}

getVideoUrl(): SafeResourceUrl | null {
  if (this.isWatchingLesson && this.currentLesson) {
    return this.getLessonVideoUrl(this.currentLesson);
  }

  if (!this.module?.video) {
    console.log('No module video found');
    return null;
  }

  let url: string;
  if (this.module.video.startsWith('http')) {
    // URL YouTube ou externe
    url = this.normalizeVideoUrl(this.module.video);
    console.log('YouTube/External URL:', url);
  } else {
    // Vidéo locale - Utiliser l'endpoint de streaming
    url = `${environment.baseUrl}/api/video/stream/${this.module.video}`;
    console.log('Local video URL:', url);
  }

  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

getLessonVideoUrl(lesson: Lesson): SafeResourceUrl | null {
  if (!lesson.contenu) {
    console.log('No lesson content found');
    return null;
  }

  let url: string;
  if (lesson.contenu.startsWith('http')) {
    // URL YouTube ou externe
    url = this.normalizeVideoUrl(lesson.contenu);
    console.log('Lesson YouTube URL:', url);
  } else {
    // Vidéo locale
    url = `${environment.baseUrl}/api/video/stream/${lesson.contenu}`;
    console.log('Lesson local video URL:', url);
  }

  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

isYoutubeVideo(): boolean {
  let url: string | undefined;
  
  if (this.isWatchingLesson && this.currentLesson) {
    url = this.currentLesson.contenu;
  } else if (this.module) {
    url = this.module.video;
  }

  if (!url) {
    console.log('No video URL to check');
    return false;
  }

  const isYoutube = url.includes('youtube.com') || 
                    url.includes('youtu.be') || 
                    url.startsWith('https://www.youtube.com');
  
  console.log('Is YouTube video:', isYoutube, 'URL:', url);
  return isYoutube;
}

private normalizeVideoUrl(url: string): string {
  console.log('Normalizing video URL:', url);
  
  // YouTube URL normalization
  if (url.includes('youtube.com/watch?v=')) {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        const normalized = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&autoplay=0`;
        console.log('Normalized YouTube URL:', normalized);
        return normalized;
      }
    } catch (e) {
      console.error('Error parsing YouTube URL:', e);
    }
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      const normalized = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&autoplay=0`;
      console.log('Normalized youtu.be URL:', normalized);
      return normalized;
    }
  } else if (url.includes('youtube.com/embed/')) {
    const baseUrl = url.split('?')[0];
    const normalized = `${baseUrl}?enablejsapi=1&modestbranding=1&rel=0&autoplay=0`;
    console.log('Already embedded YouTube URL:', normalized);
    return normalized;
  }

  return url;
}
}
