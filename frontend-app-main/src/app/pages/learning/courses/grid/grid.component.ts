import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ModuleService } from 'src/app/services/module.service';
import { Module, Level } from 'src/app/models/module';
import { CategorieService } from 'src/app/services/categorie.service';

@Component({
  selector: 'app-module-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  providers: [DecimalPipe]
})
export class ModuleGridComponent implements OnInit,AfterViewInit{
  term: any;
  breadCrumbItems!: Array<{}>;
  deleteID: any;
  isSubmitting = false;
  categorieMap: { [id: number]: string } = {};
  useDefaultImages = true;

  ModuleForm!: UntypedFormGroup;
  submitted = false;
  masterSelected!: boolean;
  moduleGrid: Module[] = [];
  modules: Module[] = [];

  // File handling
  selectedImageFile: File | null = null;
  selectedVideoFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  @ViewChild('addModule', { static: false }) addModule?: ModalDirective;
  @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal?: ModalDirective;
  editData: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private moduleService: ModuleService,
    private categorieService: CategorieService,
    private router: Router
  ) {}
  ngAfterViewInit(): void {
  this.initScrollDetector();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.breadCrumbItems = [
      { label: 'Modules', active: true },
      { label: 'Grid View', active: true }
    ];

    this.ModuleForm = this.formBuilder.group({
      id: [''],
      titre: ['', [Validators.required]],
      short_description: ['', [Validators.required]],
      long_description: ['', [Validators.required]],
      level: ['', [Validators.required]],
      lectureTime: [''],
      prixInitial: ['', [Validators.required]],
      discount: [''],
      categorieId: [''],
      formateurId: [''],
      image: [''],
      video: [''],
      chapitres: this.formBuilder.array([])
    });

    this.loadModules();
  }

  loadModules(): void {
    document.getElementById('elmLoader')?.classList.remove('d-none');

    this.moduleService.getAllModule().subscribe({
      next: (data) => {
        const role = localStorage.getItem('role');
        const userId = Number(localStorage.getItem('userId'));
        const fullName = localStorage.getItem('fullName') || 'Inconnu';

        let filteredModules = data;

        if (role === 'formateur') {
          filteredModules = data.filter((module: any) => module.formateur?.id === userId);
        }

        this.moduleGrid = filteredModules.map((module: any) => ({
          ...module,
          formateurName: module.formateur
            ? `${module.formateur.firstName} ${module.formateur.lastName}`
            : fullName
        }));

        this.modules = this.moduleGrid.slice(0, 10);
        document.getElementById('elmLoader')?.classList.add('d-none');
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        document.getElementById('elmLoader')?.classList.add('d-none');
      }
    });
  }

  loadCategories() {
    this.categorieService.getAllCategories().subscribe({
      next: (cats) => {
        cats.forEach(cat => {
          this.categorieMap[cat.id] = cat.nom;
        });
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  getCategorieName(id: number): string {
    return this.categorieMap[id] || 'N/A';
  }

  getFormateurName(module: any): string {
    const fullName = localStorage.getItem('fullName');
    return fullName || 'N/A';
  }

  navigateToOverview(moduleId: number | undefined): void {
    if (!moduleId) {
      console.error('Module ID is required for navigation');
      return;
    }
    this.router.navigate(['/learning/courses/overview', moduleId]);
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedVideoFile = file;
    }
  }

saveModule(): void {
  this.ModuleForm.markAllAsTouched();

  if (this.ModuleForm.invalid) {
    console.warn('Form is invalid:', this.ModuleForm.errors);
    this.showValidationErrors();
    return;
  }

  this.isSubmitting = true;
  const formData: Module = this.prepareModuleData();

  console.log('Module data to save:', formData);

  if (formData.id) {
    // MODE UPDATE
    this.moduleService.updateModuleFull(
      formData.id,
      formData,
      this.selectedImageFile || undefined, // ✅ undefined si pas de nouveau fichier
      this.selectedVideoFile || undefined  // ✅ undefined si pas de nouveau fichier
    ).subscribe({
      next: (updatedModule) => {
        console.log('Module updated successfully:', updatedModule);
        this.showSuccessMessage('Module mis à jour avec succès!');
        this.loadModules();
        this.addModule?.hide();
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating module:', error);
        this.showErrorMessage('Erreur lors de la mise à jour: ' + (error.error?.message || error.message));
        this.isSubmitting = false;
      }
    });
  } else {
    // MODE CREATE - reste identique
    this.moduleService.createModuleFull(
      formData,
      this.selectedImageFile || undefined,
      this.selectedVideoFile || undefined
    ).subscribe({
      next: (newModule) => {
        console.log('Module created successfully:', newModule);
        this.showSuccessMessage('Module créé avec succès!');
        this.loadModules();
        this.addModule?.hide();
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating module:', error);
        this.showErrorMessage('Erreur lors de la création: ' + (error.error?.message || error.message));
        this.isSubmitting = false;
      }
    });
  }
}

  // Préparer les données du module avec nettoyage
  private prepareModuleData(): Module {
    const formValue = this.ModuleForm.value;

    // Nettoyer les chapitres et lessons
    const chapitres = formValue.chapitres?.map((chapitre: any, chapIndex: number) => ({
      id: chapitre.id || null,
      titre: chapitre.titre?.trim(),
      ordre: chapitre.ordre || (chapIndex + 1),
      moduleId: formValue.id || null,
      lessons: chapitre.lessons?.map((lesson: any, lessonIndex: number) => ({
        id: lesson.id || null,
        titre: lesson.titre?.trim(),
        contenu: lesson.contenu?.trim() || '',
        description: lesson.description?.trim() || '',
        ordre: lesson.ordre || (lessonIndex + 1),
        duree: lesson.duree?.trim() || '',
        chapitreId: chapitre.id || null
      })) || []
    })) || [];

    return {
      ...formValue,
      chapitres: chapitres
    };
  }

  // Afficher les erreurs de validation
  private showValidationErrors(): void {
    const alertElement = document.getElementById('alert-error-msg');
    if (alertElement) {
      alertElement.classList.remove('d-none');
      alertElement.innerHTML = '<strong>Erreur!</strong> Veuillez remplir tous les champs obligatoires.';
      
      setTimeout(() => {
        alertElement.classList.add('d-none');
      }, 5000);
    }
  }

  // Afficher un message de succès
  private showSuccessMessage(message: string): void {
    // Vous pouvez utiliser un toast ou une notification
    console.log('SUCCESS:', message);
    alert(message);
  }

  // Afficher un message d'erreur
  private showErrorMessage(message: string): void {
    console.error('ERROR:', message);
    alert(message);
  }

  removeItem(id: any): void {
    this.deleteID = id;
    this.deleteRecordModal?.show();
  }

  confirmDelete(): void {
    if (this.deleteID) {
      this.moduleService.deleteModule(this.deleteID).subscribe({
        next: () => {
          this.loadModules();
          this.deleteRecordModal?.hide();
        },
        error: (error) => {
          console.error('Error deleting module:', error);
          this.deleteRecordModal?.hide();
        }
      });
    }
  }

  filterdata(): void {
    if (this.term) {
      this.modules = this.moduleGrid.filter((module: Module) =>
        module.titre.toLowerCase().includes(this.term.toLowerCase()) ||
        module.short_description.toLowerCase().includes(this.term.toLowerCase())
      );
    } else {
      this.modules = this.moduleGrid.slice(0, 10);
    }
    this.updateNoResultDisplay();
  }

  updateNoResultDisplay(): void {
    const noResultElement = document.querySelector('.noresult') as HTMLElement;
    const paginationElement = document.getElementById('pagination-element') as HTMLElement;

    if (this.term && this.modules.length === 0) {
      noResultElement.style.display = 'block';
      paginationElement.classList.add('d-none');
    } else {
      noResultElement.style.display = 'none';
      paginationElement.classList.remove('d-none');
    }
  }

  pageChanged(event: any): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.modules = this.moduleGrid.slice(startItem, endItem);
  }

  getLevelBadgeClass(level: Level | undefined): string {
    if (!level) return 'bg-secondary-subtle text-secondary';

    switch (level) {
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

  getFinalPrice(initialPrice: number, discount?: number): number {
    if (discount && discount > 0) {
      return initialPrice - (initialPrice * discount / 100);
    }
    return initialPrice;
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'assets/images/default-module.jpg';
    }
    return imageUrl;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-module.jpg';
  }

  toggleImageMode(): void {
    this.useDefaultImages = !this.useDefaultImages;
    this.loadModules();
  }

  // FormArray getters
  get chapitres(): FormArray {
    return this.ModuleForm.get('chapitres') as FormArray;
  }

  // Créer un FormGroup complet pour un chapitre
 createChapitreFormGroup(): UntypedFormGroup {
  return this.formBuilder.group({
    id: [null],
    titre: ['', Validators.required],
    ordre: [0, Validators.required], // ✅ Obligatoire
    moduleId: [null],
    lessons: this.formBuilder.array([])
  });
}

createLessonFormGroup(): UntypedFormGroup {
  return this.formBuilder.group({
    id: [null],
    titre: ['', Validators.required],
    contenu: [''], // ✅ Important
    description: [''], // ✅ Important
    ordre: [0, Validators.required], // ✅ Obligatoire
    duree: [''], // ✅ Important
    chapitreId: [null]
  });
}
  addChapitre(): void {
    const newChapitre = this.createChapitreFormGroup();
    // Définir l'ordre automatiquement
    newChapitre.patchValue({ ordre: this.chapitres.length + 1 });
    this.chapitres.push(newChapitre);
  }

  removeChapitre(index: number): void {
    this.chapitres.removeAt(index);
    // Réorganiser les ordres
    this.reorderChapitres();
  }

  getLessons(chapitreIndex: number): FormArray {
    return this.chapitres.at(chapitreIndex).get('lessons') as FormArray;
  }

  addLesson(chapitreIndex: number): void {
    const lessons = this.getLessons(chapitreIndex);
    const newLesson = this.createLessonFormGroup();
    // Définir l'ordre automatiquement
    newLesson.patchValue({ ordre: lessons.length + 1 });
    lessons.push(newLesson);
  }

  removeLesson(chapitreIndex: number, lessonIndex: number): void {
    this.getLessons(chapitreIndex).removeAt(lessonIndex);
    // Réorganiser les ordres
    this.reorderLessons(chapitreIndex);
  }

  // Réorganiser les ordres des chapitres après suppression
  private reorderChapitres(): void {
    this.chapitres.controls.forEach((chapitre, index) => {
      chapitre.patchValue({ ordre: index + 1 });
    });
  }

  // Réorganiser les ordres des lessons après suppression
  private reorderLessons(chapitreIndex: number): void {
    const lessons = this.getLessons(chapitreIndex);
    lessons.controls.forEach((lesson, index) => {
      lesson.patchValue({ ordre: index + 1 });
    });
  }

  editList(id: any): void {
    this.resetForm();

    const moduleData = this.modules[id];

    if (!moduleData.id) {
      console.error('Module ID is missing');
      return;
    }

    this.isSubmitting = true;

    this.moduleService.getModuleByid(moduleData.id).subscribe({
      next: (fullModule) => {
        console.log('Full module loaded:', fullModule);

        this.addModule?.show();

        const modalTitle = document.querySelector('.modal-title') as HTMLElement;
        modalTitle.innerHTML = 'Edit Module';
        const modalBtn = document.getElementById('add-btn') as HTMLElement;
        modalBtn.innerHTML = 'Update';

        this.editData = fullModule;

        // Patcher les valeurs du module
        this.ModuleForm.patchValue({
          id: fullModule.id,
          titre: fullModule.titre,
          short_description: fullModule.short_description,
          long_description: fullModule.long_description,
          level: fullModule.level,
          lectureTime: fullModule.lectureTime,
          prixInitial: fullModule.prixInitial,
          discount: fullModule.discount,
          categorieId: fullModule.categorieId,
          formateurId: fullModule.formateurId
        });

        // Charger l'image preview
        if (fullModule.image) {
          this.imagePreviewUrl = fullModule.image;
        }

        // Charger les chapitres avec tous leurs attributs
        if (fullModule.chapitres && fullModule.chapitres.length > 0) {
          fullModule.chapitres.forEach((chapitre: any) => {
            const chapitreGroup = this.createChapitreFormGroup();
            
            // Patcher TOUS les attributs du chapitre
            chapitreGroup.patchValue({
              id: chapitre.id,
              titre: chapitre.titre,
              ordre: chapitre.ordre || 0,
              moduleId: chapitre.moduleId || fullModule.id
            });

            // Charger les lessons avec tous leurs attributs
            if (chapitre.lessons && chapitre.lessons.length > 0) {
              const lessonsArray = chapitreGroup.get('lessons') as FormArray;
              chapitre.lessons.forEach((lesson: any) => {
                const lessonGroup = this.createLessonFormGroup();
                
                // Patcher TOUS les attributs de la lesson
              lessonGroup.patchValue({
  id: lesson.id,
  titre: lesson.titre,
  contenu: lesson.contenu || '',
  description: lesson.description || '',
  ordre: lesson.ordre || 0,
  duree: lesson.duree || '',
  chapitreId: lesson.chapitreId || chapitre.id
});
                
                lessonsArray.push(lessonGroup);
              });
            }

            this.chapitres.push(chapitreGroup);
          });
        }

        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error loading module details:', error);
        this.isSubmitting = false;
        alert('Erreur lors du chargement du module. Veuillez réessayer.');
      }
    });
  }

  private resetForm(): void {
    this.ModuleForm.reset();

    // Vider le FormArray des chapitres
    while (this.chapitres.length > 0) {
      this.chapitres.removeAt(0);
    }

    this.selectedImageFile = null;
    this.selectedVideoFile = null;
    this.imagePreviewUrl = null;
    this.isSubmitting = false;

    setTimeout(() => {
      const modalTitle = document.querySelector('.modal-title') as HTMLElement;
      if (modalTitle) modalTitle.innerHTML = 'Add Module';
      const modalBtn = document.getElementById('add-btn') as HTMLElement;
      if (modalBtn) modalBtn.innerHTML = 'Add Module';
    }, 100);
  }



   private initScrollDetector(): void {
    // Attendre que le modal soit complètement chargé
    setTimeout(() => {
      const modalBody = document.querySelector('.modal-body');
      
      if (modalBody) {
        modalBody.addEventListener('scroll', this.handleScroll.bind(this));
      }
    }, 500);
  }

  /**
   * Gère l'événement de scroll
   */
  private handleScroll(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Ajouter la classe 'scrolled' si on a scrollé de plus de 10px
    if (target.scrollTop > 10) {
      target.classList.add('scrolled');
    } else {
      target.classList.remove('scrolled');
    }

    // Optionnel: Log de la position du scroll pour debug
    // console.log('Scroll position:', target.scrollTop);
  }

  /**
   * Scroll vers le haut du modal
   */
  scrollToTop(): void {
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
      modalBody.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Scroll vers un chapitre spécifique
   */
  scrollToChapitre(index: number): void {
    const modalBody = document.querySelector('.modal-body');
    const chapitreElement = document.querySelectorAll('.card.shadow-sm')[index];
    
    if (modalBody && chapitreElement) {
      const elementPosition = (chapitreElement as HTMLElement).offsetTop;
      modalBody.scrollTo({
        top: elementPosition - 100, // 100px de marge
        behavior: 'smooth'
      });
    }
  }

  /**
   * Nettoyer les event listeners lors de la destruction du composant
   */
  ngOnDestroy(): void {
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
      modalBody.removeEventListener('scroll', this.handleScroll.bind(this));
    }
  }
}