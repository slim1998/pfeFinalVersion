import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, delay, map, Observable, of, Subject, Subscription } from 'rxjs';
import { Categorie } from 'src/app/models/categorie';
import { Formateur } from 'src/app/models/formateur';
import { Module } from 'src/app/models/module';
import { Review } from 'src/app/models/review';
import { CategorieService } from 'src/app/services/categorie.service';
import { FormateurService } from 'src/app/services/formateur.service';
import { ModuleService } from 'src/app/services/module.service';
import { ReviewService } from 'src/app/services/review.service';
import { ApprenantListComponent } from '../learning/courses/list-apprenant/list-apprenant.component';
import { ApprenantService } from 'src/app/services/apprenant.service';









export interface FooterLink {
  text: string;
  url: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  name: string;
  icon: string;
  url: string;
}

export interface FooterData {
  brandDescription: string;
  sections: FooterSection[];
  socialLinks: SocialLink[];
  bottomLinks: FooterLink[];
  copyright: string;
}



interface HeroFeature {
  icon: string;
  text: string;
}

interface Stat {
  icon: string;
  count: string;
  label: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  duration: string;
  gradient: string;
  icon: string;
  instructor: {
    name: string;
    avatar: string;
  };
}

interface CourseCategory {
  id: number;
  name: string;
  active: boolean;
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule ,RouterModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy {

 @ViewChild('navbar') navbar!: ElementRef;

 reviews: Review[] = [];
 
  paginatedReviews: Review[] = [];
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  
  // Statistiques
  averageRating: number = 0;
  totalReviews: number = 0;
  ratingDistribution: { [key: number]: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  loading: boolean = true;
  error: string = '';

  // Pour utiliser Math dans le template
  Math = Math;










  isMenuOpen = false;


  listModules: Module[] = [];
  listCategories: Categorie[] = []; // Correction du nom
  filteredCourses: Module[] = [];
  selectedCategory: number | 'ALL' = 'ALL';
testAuth!:boolean
private authSubscription?: Subscription;
  constructor(
    private router: Router,
    private moduleService: ModuleService,
    private categorieService: CategorieService,
    private formateurService : FormateurService,
    private reviewService: ReviewService,
    private apprenantService: ApprenantService
  ) {}

  ngOnInit(): void {
  this.loadReviews();
  this.authSubscription = this.apprenantService.authStatus$.subscribe(
      (isAuthenticated) => {
        this.testAuth = isAuthenticated;
        console.log('Auth status changed:', this.testAuth);
      }
    );

   if (!sessionStorage.getItem('reloaded')) {
    sessionStorage.setItem('reloaded', 'true');
    window.location.reload();
  } else {
    sessionStorage.removeItem('reloaded');
  }
    this.getAllModule();
    this.getAllCategorie();
    this.initializeAnimations();
    this.loadReviews();
    this.loadExperts();
    this.initializeCardsPerView();
    this.loadFormationCounts();



  }
  
isAuthenticate(){
 this.testAuth =  this.apprenantService.isUserAuthenticatedtest()
}

  // Correction de la méthode getAllModule
  getAllModule() {
    this.moduleService.getAllModule().subscribe({
      next: (data) => {
        this.listModules = data;
        this.filteredCourses = data; // Initialiser avec tous les modules
        console.log('Liste des modules : ', data);
      },
      error: () => console.log('Erreur lors du chargement des modules')
    });
  }

  // Correction de la méthode getAllCategorie
  getAllCategorie() {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.listCategories = data; // Correction du nom de propriété
        console.log('Liste des catégories : ', data);
      },
      error: () => console.log('Erreur lors du chargement des catégories')
    });
  }

  // Méthode pour obtenir le nom de la catégorie
  getCategoryName(categorieId: number | undefined): string {
    if (!categorieId || !this.listCategories) {
      return 'Non catégorisé';
    }

    const category = this.listCategories.find(cat => cat.id === categorieId);
    return category ? category.nom : 'Non catégorisé';
  }



  // Méthode filterByCategory corrigée
  filterByCategory(categoryId: number | 'ALL') {
    this.selectedCategory = categoryId;

    if (categoryId === 'ALL') {
      this.filteredCourses = [...this.listModules];
      return;
    }

    const catIdNum = Number(categoryId);

    this.filteredCourses = this.listModules.filter((course: Module) => {
      return course.categorieId === catIdNum;
    });
  }










  // Hero Section Data
  heroFeatures: HeroFeature[] = [
    { icon: 'fas fa-users', text: 'Apprendre avec des experts' },
    { icon: 'fas fa-certificate', text: 'Obtenir un certificat' },
    { icon: 'fas fa-crown', text: 'Adhésion premium' }
  ];

  heroData = {
    studentImage: '/assets/images/element/07.png',
    studentAlt: 'Étudiant',
    notification: {
      title: 'Félicitations !',
      message: 'Votre inscription est complétée'
    },
    dailyStudents: {
      title: 'Nos nouveaux étudiants quotidiens',
      avatars: [
        { src: 'https://images.unsplash.com/photo-1494790108755-2616c8ee4ae3?w=50&h=50&fit=crop&crop=face', alt: 'Étudiant 1' },
        { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face', alt: 'Étudiant 2' },
        { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face', alt: 'Étudiant 3' },
        { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face', alt: 'Étudiant 4' }
      ],
      count: '1K+'
    }
  };

  // Stats Data
  statsData: Stat[] = [
    { icon: 'fas fa-users', count: '10K+', label: 'Étudiants actifs' },
    { icon: 'fas fa-book', count: '200+', label: 'Cours disponibles' },
    { icon: 'fas fa-chalkboard-teacher', count: '50+', label: 'Instructeurs experts' },
    { icon: 'fas fa-award', count: '60K+', label: 'Étudiants satisfaits' }
  ];

  // Couleurs Bootstrap pour chaque carte
  private cardClasses = [
    'bg-primary bg-opacity-15',    // Bleu pour étudiants
    'bg-success bg-opacity-15',    // Vert pour cours
    'bg-warning bg-opacity-15',    // Jaune pour instructeurs
    'bg-info bg-opacity-15'        // Cyan pour satisfaits
  ];

  private iconClasses = [
    'text-primary',
    'text-success',
    'text-warning',
    'text-info'
  ];




  ngAfterViewInit(): void {
    // Initialiser PureCounter si disponible
    this.initializePureCounter();
  }

  /**
   * Retourne la classe CSS pour la carte selon l'index
   */
  getStatCardClass(index: number): string {
    return this.cardClasses[index % this.cardClasses.length];
  }

  /**
   * Retourne la classe CSS pour l'icône selon l'index
   */
  getStatIconClass(index: number): string {
    return this.iconClasses[index % this.iconClasses.length];
  }

  /**
   * Extrait le numéro du count (ex: "10K+" -> 10)
   */
  getCountNumber(count: string): number {
    const match = count.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Extrait le suffixe du count (ex: "10K+" -> "K+")
   */
  getCountSuffix(count: string): string {
    const match = count.match(/\d+(.+)/);
    return match ? match[1] : '';
  }

  /**
   * Initialise PureCounter pour les animations de comptage
   */
  private initializePureCounter(): void {
    // Vérifier si PureCounter est disponible
    if (typeof (window as any).PureCounter !== 'undefined') {
      new (window as any).PureCounter();
    } else {
      // Fallback: animation simple avec setTimeout
      this.animateCountersManually();
    }
  }

  /**
   * Animation manuelle des compteurs si PureCounter n'est pas disponible
   */
  private animateCountersManually(): void {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach((counter, index) => {
      const target = this.getCountNumber(this.statsData[index].count);
      const duration = 2000; // 2 secondes
      const delay = index * 200; // Délai échelonné

      setTimeout(() => {
        this.animateCounter(counter as HTMLElement, 0, target, duration);
      }, delay);
    });
  }

  /**
   * Anime un compteur individuel
   */
  private animateCounter(element: HTMLElement, start: number, end: number, duration: number): void {
    const increment = end / (duration / 16); // 60 FPS
    let current = start;

    const timer = setInterval(() => {
      current += increment;

      if (current >= end) {
        current = end;
        clearInterval(timer);
      }

      element.textContent = Math.floor(current).toString();
    }, 16);
  }




  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    if (this.navbar) {
      const navbar = this.navbar.nativeElement;
      if (window.pageYOffset > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }



  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }



  newsletterEmail: string = '';

  footerData: FooterData = {
    brandDescription: `L'Agence Nationale de la Cybersécurité est chargée, en coordination
     avec les différentes structures impliquées dans le domaine, de la supervision de la sécurité des systèmes d'information et de
     communication des structures publiques et privées de l’espace cybernétique national `,

    sections: [
      {
        title: 'Formation',
        links: [
          { text: 'Nos Programmes', url: '/programmes' },
          { text: 'Formation Continue', url: '/formation-continue' },
          { text: 'Certification', url: '/certification' },
          { text: 'E-Learning', url: '/e-learning' },
          { text: 'Stages & Alternance', url: '/stages' }
        ]
      },
      {
        title: 'Services',
        links: [
          { text: 'Orientation', url: '/orientation' },
          { text: 'Bibliothèque', url: '/bibliotheque' },
          { text: 'Support Étudiant', url: '/support' },
          { text: 'Carrières', url: '/carrieres' },
          { text: 'Alumni', url: '/alumni' }
        ]
      },
      {
        title: 'À Propos',
        links: [
          { text: 'Notre Histoire', url: '/histoire' },
          { text: 'Équipe Pédagogique', url: '/equipe' },
          { text: 'Valeurs & Mission', url: '/mission' },
          { text: 'Actualités', url: '/actualites' },
          { text: 'Partenariats', url: '/partenaires' }
        ]
      }
    ],

    socialLinks: [
      {
        name: 'Facebook',
        icon: 'fab fa-facebook-f',
        url: 'https://facebook.com/votreprofil'
      },
      {
        name: 'Twitter',
        icon: 'fab fa-twitter',
        url: 'https://twitter.com/votreprofil'
      },
      {
        name: 'LinkedIn',
        icon: 'fab fa-linkedin-in',
        url: 'https://linkedin.com/company/votreprofil'
      },
      {
        name: 'Instagram',
        icon: 'fab fa-instagram',
        url: 'https://instagram.com/votreprofil'
      },
      {
        name: 'YouTube',
        icon: 'fab fa-youtube',
        url: 'https://youtube.com/votrechaine'
      }
    ],

    bottomLinks: [
      { text: 'Mentions Légales', url: '/mentions-legales' },
      { text: 'Politique de Confidentialité', url: '/confidentialite' },
      { text: 'Conditions d\'Utilisation', url: '/conditions' },
      { text: 'Plan du Site', url: '/sitemap' },
      { text: 'Contact', url: '/contact' }
    ],

    copyright: '© 2024 École d\'Excellence. Tous droits réservés. Conçu avec passion pour l\'éducation.'
  };




  /**
   * Gère la soumission du formulaire de newsletter
   * @param event - L'événement de soumission du formulaire
   */
  onNewsletterSubmit(event: Event): void {
    event.preventDefault();

    if (this.isValidEmail(this.newsletterEmail)) {
      this.subscribeToNewsletter(this.newsletterEmail);
    } else {
      this.showError('Veuillez entrer une adresse email valide.');
    }
  }

  /**
   * Abonne un utilisateur à la newsletter
   * @param email - L'adresse email de l'utilisateur
   */
  private subscribeToNewsletter(email: string): void {
    // Ici, vous pouvez appeler votre service de newsletter
    console.log('Abonnement newsletter:', email);

    // Simulation d'un appel API
    setTimeout(() => {
      this.showSuccess('Merci ! Votre abonnement a été confirmé.');
      this.newsletterEmail = '';
    }, 1000);
  }

  /**
   * Valide le format de l'adresse email
   * @param email - L'adresse email à valider
   * @returns true si l'email est valide, false sinon
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Affiche un message de succès
   * @param message - Le message à afficher
   */
  private showSuccess(message: string): void {
    // Ici, vous pouvez utiliser votre service de notifications
    // Par exemple: this.toastr.success(message);
    alert(message); // Temporaire
  }

  /**
   * Affiche un message d'erreur
   * @param message - Le message d'erreur à afficher
   */
  private showError(message: string): void {
    // Ici, vous pouvez utiliser votre service de notifications
    // Par exemple: this.toastr.error(message);
    alert(message); // Temporaire
  }

  /**
   * Initialise les animations du footer
   */
  private initializeAnimations(): void {
    // Vous pouvez ajouter ici des animations personnalisées
    // Par exemple, avec GSAP ou des animations CSS personnalisées

    // Animation d'apparition au scroll
    if (typeof window !== 'undefined') {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, observerOptions);

      // Observer les sections du footer
      setTimeout(() => {
        const footerSections = document.querySelectorAll('.footer-section');
        footerSections.forEach(section => observer.observe(section));
      }, 100);
    }
  }

  /**
   * Gère le clic sur un lien social
   * @param social - Les informations du lien social
   */
  onSocialClick(social: SocialLink): void {
    // Vous pouvez ajouter ici du tracking analytics
    console.log(`Clic sur ${social.name}:`, social.url);

    // Optionnel: tracking Google Analytics
    // gtag('event', 'social_click', {
    //   'social_network': social.name,
    //   'url': social.url
    // });
  }











  private loadingSubject = new BehaviorSubject<boolean>(false);

private destroy$ = new Subject<void>();

  // Propriétés manquantes
  reviewsData: Review[] = [];
  filteredReviews: Review[] = [];
  showReviewModal: boolean = false;
  isLoading: boolean = false;

  // Filtres
  selectedCourseFilter: string = '';
  selectedRatingFilter: string = '';

  // Pagination




  // Nouveau review pour le formulaire





 

  /**
   * Charge les reviews (remplacez par un appel au service)
   */


  /**
   * Calcule les statistiques des reviews
   */
  calculateStats(): void {
    const totalReviews = this.reviewsData.length;
    const averageRating = totalReviews > 0
      ? this.reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = this.reviewsData.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

    const recommendedReviews = this.reviewsData.filter(review => review.rating >= 4).length;
    const recommendationRate = totalReviews > 0
      ? (recommendedReviews / totalReviews) * 100
      : 0;

  
  }

  /**
   * Ouvre la modal d'ajout de review
   */
 

  /**
   * Ferme la modal d'ajout de review
   */


  /**
   * Définit la note dans le formulaire
   */
 
  /**
   * Soumet le nouveau review
   */

  /**
   * Valide le nouveau review
   */

  /**
   * Remet à zéro le formulaire
   */
  /**
   * Génère un ID unique
   */
  private generateId(): number {
    return Math.max(...this.reviewsData.map(r => r.id), 0) + 1;
  }

  /**
   * Génère un avatar par défaut
   */
  generateAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=80&bold=true`;
  }


  filterReviews(): void {
    let filtered = [...this.reviewsData];

    // Filtre par cours
    if (this.selectedCourseFilter) {
      filtered = filtered.filter(review => review.moduleName=== this.selectedCourseFilter);
    }

    // Filtre par note
    if (this.selectedRatingFilter) {
      const rating = parseInt(this.selectedRatingFilter);
      filtered = filtered.filter(review => review.rating === rating);
    }

    this.filteredReviews = filtered;
    this.calculatePagination();
    this.currentPage = 1; // Reset à la première page
  }

  /**
   * Calcule la pagination
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredReviews.length / this.itemsPerPage);
  }

  /**
   * Va à une page spécifique
   */

  /**
   * Obtient les numéros de page pour la pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Ajuster le début si on est près de la fin
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Obtient les reviews paginées
   */


  /**
   * Efface tous les filtres
   */
  clearFilters(): void {
    this.selectedCourseFilter = '';
    this.selectedRatingFilter = '';
    this.filterReviews();
  }















// formateur  card

experts: Formateur[] = [];
  currentIndex = 0;
  cardsPerView = 3; // Nombre de cartes visibles à la fois
  isLoadingExperts = true;
  expertsError = '';


  // Stockage des nombres de formations par formateur


  // Auto-play configuration (optionnel)
  private autoPlayInterval: any;
  autoPlay = false; // Changez à true si vous voulez l'auto-play
  autoPlayDelay = 5000;

  formationCounts: { [key: number]: number } = {};

loadExperts(): void {
  this.formateurService.getAllFormateurs().subscribe({
    next: (data) => {
      this.experts = data;
      console.log("Experts:", this.experts);
      this.loadFormationCounts();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Erreur lors du chargement des experts:', error);
      this.error = 'Erreur lors du chargement des experts';
      this.isLoading = false;
    }
  });
}

loadFormationCounts(): void {
  this.experts.forEach(expert => {
    if (!expert.id) {
      console.warn("Expert sans id:", expert);
      return;
    }

    this.formateurService.getFormationCountByFormateur(expert.id).subscribe({
      next: (count) => {
        console.log(`Formations pour ${expert.id}:`, count);
        this.formationCounts[expert.id] = count;
      },
      error: (err) => {
        console.error(`Erreur pour formateur ${expert.id}:`, err);
        this.formationCounts[expert.id] = 0;
      }
    });
  });
}

getFormationCount(id: number): number {
  return this.formationCounts[id] || 0;
}


  // Navigation du carrousel


  // Méthode pour obtenir l'URL de la photo
  getPhotoUrl(photo: string): string {
    if (!photo) {
      return 'assets/images/default-avatar.png';
    }
    return photo.startsWith('http') ? photo : `assets/images/${photo}`;
  }

  // Méthode pour ajuster le nombre de cartes selon la taille de l'écran
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.initializeCardsPerView();
  }

  private initializeCardsPerView(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.cardsPerView = 1;
    } else if (width < 1200) {
      this.cardsPerView = 2;
    } else {
      this.cardsPerView = 3;
    }

    // Ajuster l'index si nécessaire
    if (this.currentIndex > this.experts.length - this.cardsPerView) {
      this.currentIndex = Math.max(0, this.experts.length - this.cardsPerView);
    }
  }

  // Auto-play methods

  // Actions des boutons des cartes
  viewProfile(expert: Formateur): void {
    // Naviguer vers la page de profil de l'expert
    console.log('Voir profil de:', expert);
    // Exemple de navigation :
    // this.router.navigate(['/expert', expert.id]);

    // Ou ouvrir dans une modal
    // this.openProfileModal(expert);
  }

  contactExpert(expert: Formateur): void {
    // Ouvrir le client email par défaut
    const subject = encodeURIComponent('Demande de renseignement sur vos formations');
    const body = encodeURIComponent(`Bonjour ${expert.firstName} ${expert.lastName},\n\nJe souhaiterais obtenir des informations sur vos formations.\n\nCordialement,`);

    window.location.href = `mailto:${expert.email}?subject=${subject}&body=${body}`;
  }

  // Méthode utilitaire pour vérifier si toutes les formations sont chargées
  areAllFormationCountsLoaded(): boolean {
    return this.experts.every(expert => this.formationCounts[expert.id] !== undefined);
  }

  // Méthode pour recharger les données
  refreshData(): void {
    this.isLoading = true;
    this.error = '';
    this.formationCounts = {};
    this.loadExperts();
  }


   trackByExpert(index: number, expert: any): any {
    return expert.id;
  }




  // Propriétés pour l'autoplay
  private autoPlayTimer: any;
  private isPaused: boolean = false;

  // carouselle
  // Méthodes de navigation du carousel (existantes)
  nextSlide() {
    if (this.canGoNext()) {
      this.currentIndex++;
    } else if (this.autoPlay) {
      this.currentIndex = 0; // Retour au début pour l'autoplay
    }
  }

  prevSlide() {
    if (this.canGoPrev()) {
      this.currentIndex--;
    } else if (this.autoPlay) {
      this.currentIndex = this.getMaxIndex(); // Aller à la fin pour l'autoplay
    }
  }

  canGoNext(): boolean {
    return this.currentIndex < this.getMaxIndex();
  }

  canGoPrev(): boolean {
    return this.currentIndex > 0;
  }

  private getMaxIndex(): number {
    return Math.max(0, Math.ceil(this.experts.length / this.cardsPerView) - 1);
  }

  getIndicators(): any[] {
    const indicatorCount = Math.ceil(this.experts.length / this.cardsPerView);
    return Array(indicatorCount).fill(0).map((_, i) => i);
  }

  getProgressPercentage(): number {
    const maxIndex = this.getMaxIndex();
    return maxIndex > 0 ? (this.currentIndex / maxIndex) * 100 : 100;
  }

  // Nouvelles méthodes pour l'autoplay
  startAutoPlay() {
    if (this.autoPlay && this.experts.length > this.cardsPerView) {
      this.stopAutoPlay(); // S'assurer qu'aucun timer n'est en cours

    }
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  pauseAutoPlay() {
    this.isPaused = true;
  }

  resumeAutoPlay() {
    this.isPaused = false;
  }

  // Méthodes d'interaction avec la souris (améliorées)
  onMouseEnter() {
    this.pauseAutoPlay();
  }

  onMouseLeave() {
    this.resumeAutoPlay();
  }

  // Méthode pour déterminer le nombre de cartes par vue selon la taille d'écran
  private updateCardsPerView() {
    const width = window.innerWidth;
    if (width < 480) {
      this.cardsPerView = 1;
    } else if (width < 768) {
      this.cardsPerView = 2;
    } else if (width < 1200) {
      this.cardsPerView = 3;
    } else {
      this.cardsPerView = 4;
    }

    // Redémarrer l'autoplay avec la nouvelle configuration
    if (this.experts.length > 0) {
      // Ajuster l'index actuel si nécessaire
      const maxIndex = this.getMaxIndex();
      if (this.currentIndex > maxIndex) {
        this.currentIndex = maxIndex;
      }

      // Redémarrer l'autoplay
      this.startAutoPlay();
    }
  }

  // Méthode pour naviguer vers un slide spécifique
  goToSlide(index: number) {
    if (index >= 0 && index <= this.getMaxIndex()) {
      this.currentIndex = index;
      this.stopAutoPlay();
      this.startAutoPlay(); // Redémarrer le timer
    }
  }

  // Méthodes pour contrôler l'autoplay depuis le template
  toggleAutoPlay() {
    this.autoPlay = !this.autoPlay;
    if (this.autoPlay) {
      this.startAutoPlay();
    } else {
      this.stopAutoPlay();
    }
  }

  setAutoPlaySpeed(speed: number) {
    this.autoPlayInterval = speed;
    if (this.autoPlay) {
      this.startAutoPlay(); // Redémarrer avec la nouvelle vitesse
    }
  }






   scrollToSection(event: Event, id: string) {
    event.preventDefault(); // empêche le changement de hash dans l'URL
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' }); // scroll fluide
    }
  }
//////////////

loadReviews(): void {
    this.loading = true;
    this.error = '';

   
    this.reviewService.getAllReviews().subscribe({
      next: (data: Review[]) => {
        // Filtrer uniquement les reviews visibles
        this.reviews = data.filter(review => review.visible);
        this.filteredReviews = [...this.reviews];
        this.calculateStatistics();
        this.updatePagination();
        this.loading = false;
      },
      
      error: (err) => {
        console.error('Erreur lors du chargement des reviews:', err);
        this.error = 'Impossible de charger les témoignages.';
        this.loading = false;
      }
    });
  }

  /**
   * Calculer les statistiques des reviews
   */
  calculateStatistics(): void {
    this.totalReviews = this.filteredReviews.length;

    if (this.totalReviews === 0) {
      this.averageRating = 0;
      return;
    }

    // Calculer la moyenne
    const sum = this.filteredReviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.totalReviews) * 10) / 10;

    // Calculer la distribution
    this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.filteredReviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        this.ratingDistribution[review.rating]++;
      }
    });
  }

  /**
   * Mettre à jour la pagination
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredReviews.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.getPaginatedReviews();
  }

  /**
   * Obtenir les reviews paginées
   */
  getPaginatedReviews(): Review[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReviews = this.filteredReviews.slice(startIndex, endIndex);
    return this.paginatedReviews;
  }

  /**
   * Changer de page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getPaginatedReviews();
      this.scrollToTop();
    }
  }

  /**
   * Page précédente
   */
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  /**
   * Page suivante
   */
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  /**
   * Obtenir les pages visibles pour la pagination
   */
  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Filtrer par note
   */
  filterByRating(rating: number): void {
    if (rating === 0) {
      this.filteredReviews = [...this.reviews];
    } else {
      this.filteredReviews = this.reviews.filter(review => review.rating === rating);
    }
    this.currentPage = 1;
    this.calculateStatistics();
    this.updatePagination();
  }

  /**
   * Créer un array pour les étoiles
   */
  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  /**
   * Formater la date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  /**
   * Obtenir l'avatar par défaut
   */
  getDefaultAvatar(): string {
    return 'assets/images/default-avatar.png';
  }

  /**
   * Obtenir les initiales du nom
   */
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Scroll vers le haut de la section
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Obtenir le pourcentage d'une note
   */
  getRatingPercentage(rating: number): number {
    if (this.totalReviews === 0) return 0;
    return Math.round((this.ratingDistribution[rating] / this.totalReviews) * 100);
  }


  ngOnDestroy(): void {

        this.destroy$.next();
    this.destroy$.complete();
    // Se désabonner pour éviter les fuites mémoire
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.apprenantService.logout();
    this.router.navigate(['/auth/login']);
  }






}
