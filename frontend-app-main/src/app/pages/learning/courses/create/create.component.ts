import { Component, ViewEncapsulation, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Editor, TOOLBAR_FULL } from 'ngx-editor';
import { CdkStepper } from '@angular/cdk/stepper';

import { Router } from '@angular/router';
import { Chapitre } from 'src/app/models/chapitre';
import { Lesson } from 'src/app/models/lesson';
import { Module, Level } from 'src/app/models/module';
import { ChapitreService } from 'src/app/services/chapitre.service';
import { LessonService } from 'src/app/services/lesson.service';
import { ModuleService } from 'src/app/services/module.service';
import { CategorieService } from 'src/app/services/categorie.service';
import { Categorie } from 'src/app/models/categorie';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cdkStepper') cdkStepper!: CdkStepper;

  // Form
  courseForm!: FormGroup;

  // Editor
  editor!: Editor;
  toolbar: any = TOOLBAR_FULL;
  html = '';

  // Files
  selectedImageFile?: File;
  selectedVideoFile?: File;
  imagePreview?: string;
  videoPreview?: string;

  // Breadcrumb
  breadCrumbItems!: Array<{}>;

  // Created course data
  createdModule?: Module;

  // Level options - Fixed with proper enum values
  levelItems = [
    { name: 'All Levels', value: Level.ALL_LEVEL },
    { name: 'Beginner', value: Level.BEGINNER },
    { name: 'Intermediate', value: Level.INTERMEDIATE },
    { name: 'Advanced', value: Level.ADVENCED }
  ];

  // Category options
  public categoryOptions: Categorie[] = [];

  // Loading state
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private chapitreService: ChapitreService,
    private lessonService: LessonService,
    private categorieService: CategorieService,
    public router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {

 this.courseForm.get('enableDiscount')?.valueChanges.subscribe(enabled => {
    const discountControl = this.courseForm.get('discount');

    if (enabled) {
      // Quand activé : doit avoir une valeur > 0
      discountControl?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
      // Si actuellement 0, mettre valeur par défaut
      if (!discountControl?.value || discountControl.value === 0) {
        discountControl?.setValue(10);
      }
    } else {
      // Quand désactivé : pas de validation, valeur = 0
      discountControl?.clearValidators();
      discountControl?.setValue(0);
    }
    discountControl?.updateValueAndValidity();
  });

  this.loadCategories();
  this.breadCrumbItems = [
    { label: 'Courses', active: true },
    { label: 'Create Course', active: true }
  ];
  this.editor = new Editor();


  }

  ngAfterViewInit(): void {
    // Initialize progress bar
    setTimeout(() => {
      this.updateProgressBar();
    }, 100);
  }

  ngOnDestroy(): void {
    this.editor.destroy();
    // Clean up object URLs to prevent memory leaks
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
    if (this.videoPreview) {
      URL.revokeObjectURL(this.videoPreview);
    }
  }

  private initializeForm(): void {
    this.courseForm = this.fb.group({
      // Step 1: Course Details
      titre: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      // Fixed: Default to BEGINNER enum value
      lectureTime: ['', [Validators.required, this.timeValidator]],
      lessons: [1, [Validators.required, Validators.min(1)]],
      prixInitial: [0, [Validators.required, Validators.min(0)]],
     level: [Level.BEGINNER, Validators.required], // ✅ OBLIGATOIRE: Default enum value
    discount: [0], // ✅ Commence à 0, pas de validation
    enableDiscount: [false],
      short_description: ['', [Validators.required, Validators.minLength(10)]],
      long_description: ['', [Validators.required, Validators.minLength(20)]],
      // Step 2: Media (handled separately)
      videoURL: [''],

      // Step 3: Chapitres and Lessons
      chapitres: this.fb.array([]),

      // Additional fields
      categorieId: [1],
      formateurId: [1]
    });

    // Add initial chapter
    this.addChapitre();
  }

  // Custom validator for time format (HH:MM:SS)
  timeValidator(control: any) {
    const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (control.value && !timePattern.test(control.value)) {
      return { invalidTime: true };
    }
    return null;
  }

  // Getters for FormArray
  get chapitres(): FormArray {
    return this.courseForm.get('chapitres') as FormArray;
  }

  // Chapter management
  createChapitreForm(): FormGroup {
    return this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      ordre: [this.chapitres.length + 1],
      lessons: this.fb.array([])
    });
  }

  addChapitre(): void {
    const chapitreForm = this.createChapitreForm();
    this.chapitres.push(chapitreForm);
    // Add initial lesson to the new chapter
    this.addLesson(this.chapitres.length - 1);
  }

  removeChapitre(index: number): void {
    if (this.chapitres.length > 1) {
      this.chapitres.removeAt(index);
      // Update ordre for remaining chapters
      this.updateChapitreOrdre();
    }
  }

  updateChapitreOrdre(): void {
    this.chapitres.controls.forEach((control, index) => {
      control.get('ordre')?.setValue(index + 1);
    });
  }

  // Lesson management
  getLessons(chapitreIndex: number): FormArray {
    return this.chapitres.at(chapitreIndex).get('lessons') as FormArray;
  }

  createLessonForm(chapitreIndex: number): FormGroup {
    const lessons = this.getLessons(chapitreIndex);
    return this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      contenu: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      duree: ['', Validators.required],
      ordre: [lessons.length + 1]
    });
  }

  addLesson(chapitreIndex: number): void {
    const lessonForm = this.createLessonForm(chapitreIndex);
    this.getLessons(chapitreIndex).push(lessonForm);
  }

  removeLesson(chapitreIndex: number, lessonIndex: number): void {
    const lessons = this.getLessons(chapitreIndex);
    if (lessons.length > 1) {
      lessons.removeAt(lessonIndex);
      // Update ordre for remaining lessons
      this.updateLessonOrdre(chapitreIndex);
    }
  }

  updateLessonOrdre(chapitreIndex: number): void {
    const lessons = this.getLessons(chapitreIndex);
    lessons.controls.forEach((control, index) => {
      control.get('ordre')?.setValue(index + 1);
    });
  }

  // Image upload handlers
  onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImageFile = file;

      // Create preview
      if (this.imagePreview) {
        URL.revokeObjectURL(this.imagePreview);
      }
      this.imagePreview = URL.createObjectURL(file);
    } else if (file) {
      alert('Please select a valid image file.');
      event.target.value = '';
    }
  }

  onVideoFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      this.selectedVideoFile = file;

      // Create preview
      if (this.videoPreview) {
        URL.revokeObjectURL(this.videoPreview);
      }
      this.videoPreview = URL.createObjectURL(file);
    } else if (file) {
      alert('Please select a valid video file.');
      event.target.value = '';
    }
  }

  removeImageFile(): void {
    this.selectedImageFile = undefined;
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
      this.imagePreview = undefined;
    }
    // Reset file input
    const imageInput = document.getElementById('image-input') as HTMLInputElement;
    if (imageInput) {
      imageInput.value = '';
    }
  }

  removeVideoFile(): void {
    this.selectedVideoFile = undefined;
    if (this.videoPreview) {
      URL.revokeObjectURL(this.videoPreview);
      this.videoPreview = undefined;
    }
    // Reset file input
    const videoInput = document.getElementById('video-input') as HTMLInputElement;
    if (videoInput) {
      videoInput.value = '';
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be less than ${field.errors['max'].max}`;
      if (field.errors['invalidTime']) return `${fieldName} must be in HH:MM:SS format`;
    }
    return '';
  }

  // Progress bar update
  updateProgressBar(): void {
    const progressBar = document.querySelector('.progress-bar') as HTMLElement;
    if (progressBar) {
      const progress = ((this.cdkStepper.selectedIndex + 1) / 4) * 100;
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', progress.toString());
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.courseForm.controls).forEach(key => {
      this.courseForm.get(key)?.markAsTouched();
    });

    // Mark chapters and lessons as touched
    this.chapitres.controls.forEach(chapitre => {
      Object.keys(chapitre.value).forEach(key => {
        chapitre.get(key)?.markAsTouched();
      });

      const lessons = chapitre.get('lessons') as FormArray;
      lessons.controls.forEach(lesson => {
        Object.keys(lesson.value).forEach(key => {
          lesson.get(key)?.markAsTouched();
        });
      });
    });
  }

  // Reset form
  resetForm(): void {
    this.courseForm.reset();
    this.removeImageFile();
    this.removeVideoFile();
    this.createdModule = undefined;

    // Reset form arrays
    while (this.chapitres.length !== 0) {
      this.chapitres.removeAt(0);
    }

    // Re-initialize form with proper defaults
    this.initializeForm();
    this.cdkStepper.reset();
    this.updateProgressBar();
  }

  // Navigation method
  navigateToCourses(): void {
    this.router.navigate(['/learning/grid']);
  }

  // Track by function for ngFor
  trackByIndex(index: number, item: any): any {
    return index;
  }

  // Get total lessons count
  getTotalLessons(): number {
    return this.chapitres.controls.reduce((total, chapitre) => {
      const lessons = chapitre.get('lessons') as FormArray;
      return total + lessons.length;
    }, 0);
  }

  // Getters for template
  get titre() { return this.courseForm.get('titre'); }
  get category() { return this.courseForm.get('category'); }
  get level() { return this.courseForm.get('level'); }
  get language() { return this.courseForm.get('language'); }
  get lessons() { return this.courseForm.get('lessons'); }
  get prixInitial() { return this.courseForm.get('prixInitial'); }
  get discount() { return this.courseForm.get('discount'); }
  get short_description() { return this.courseForm.get('short_description'); }
  get long_description() { return this.courseForm.get('long_description'); }

  // Check authentication
  private checkAuthentication(): boolean {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to perform this action. Redirecting to login...');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  // Method to check if we can proceed to next step
  canProceedToStep(stepIndex: number): boolean {
    switch (stepIndex) {
      case 1: // To go to step 2 (Media)
        const step1Fields = ['titre', 'category', 'level', 'lectureTime', 'lessons', 'prixInitial', 'short_description', 'long_description'];
        return step1Fields.every(field => {
          const control = this.courseForm.get(field);
          return control && control.valid;
        });

      case 2: // To go to step 3 (Chapters) - after course creation
        return this.createdModule !== undefined;

      default:
        return true;
    }
  }

  // Method to check if media is ready for creation
  isMediaReadyForCreation(): boolean {
    // At minimum, an image is required
    return !!this.selectedImageFile;
  }

  // Create course method with enhanced error handling - FIXED
 // Méthode createCourse() complète avec tous les fixes
async createCourse(): Promise<void> {
  // 1. Vérification d'authentification
  if (!this.checkAuthentication()) {
    return;
  }

  // 2. Récupérer l'ID utilisateur
  const userId = localStorage.getItem('userId');
  const formateurId = userId ? parseInt(userId, 10) : 1;

  // 3. Vérifier la validité de l'étape 1
  if (!this.canProceedToStep(1)) {
    this.markAllFieldsAsTouched();
    alert('Please complete all required fields in Step 1 before proceeding.');
    return;
  }

  // 4. Vérifier qu'une image est uploadée
  if (!this.isMediaReadyForCreation()) {
    alert('Please upload at least a course image to continue.');
    return;
  }

  this.isLoading = true;

  try {
    // 5. Récupérer les valeurs du formulaire
    const formValue = this.courseForm.value;

    // 6. DEBUG - Vérifier les valeurs critiques
    console.log('=== DEBUG FORM VALUES ===');
    console.log('Level value:', formValue.level);
    console.log('Level type:', typeof formValue.level);
    console.log('Discount value:', formValue.discount);
    console.log('Enable discount:', formValue.enableDiscount);
    console.log('Category:', formValue.category);
    console.log('==========================');

    // 7. Validation supplémentaire pour le level
    if (!formValue.level) {
      alert('Please select a course level');
      this.isLoading = false;
      return;
    }

    // 8. Validation supplémentaire pour la catégorie
    if (!formValue.category) {
      alert('Please select a course category');
      this.isLoading = false;
      return;
    }

    // 9. Calculer le discount final
    let finalDiscount = 0;
    if (formValue.enableDiscount) {
      finalDiscount = formValue.discount && formValue.discount > 0 ? formValue.discount : 0;
    }

    // 10. Créer l'objet Module avec toutes les validations
    const module: Module = {
      titre: formValue.titre,
      short_description: formValue.short_description,
      long_description: formValue.long_description,
      level: formValue.level, // Doit être un enum Level valide
      lectureTime: formValue.lectureTime,
      prixInitial: formValue.prixInitial,
      discount: finalDiscount,
      categorieId: parseInt(formValue.category.toString(), 10), // Conversion sécurisée
      formateurId: formateurId
    };

    // 11. DEBUG - Vérifier l'objet final avant envoi
    console.log('=== FINAL MODULE OBJECT ===');
    console.log('Module to send:', module);
    console.log('Image file:', this.selectedImageFile?.name);
    console.log('Video file:', this.selectedVideoFile?.name);
    console.log('===========================');

    // 12. Appel API pour créer le module
    this.createdModule = await this.moduleService.createModuleFull(
      module,
      this.selectedImageFile!,  // ! car déjà vérifié dans isMediaReadyForCreation
      this.selectedVideoFile || undefined
    ).toPromise();

    // 13. Vérification que le module a été créé
    if (!this.createdModule || !this.createdModule.id) {
      throw new Error('Module creation failed - no ID returned');
    }

    console.log('Course created successfully:', this.createdModule);

    // 14. Passer à l'étape suivante
    this.cdkStepper.next();
    this.updateProgressBar();

    // 15. Message de succès optionnel
    // alert('Course created successfully! You can now add chapters and lessons.');

  } catch (error: any) {
    console.error('Error creating course:', error);

    // 16. Gestion détaillée des erreurs
    let errorMessage = 'Error creating course. Please try again.';

    if (error.status === 403) {
      errorMessage = 'Access forbidden. Please check your permissions or login again.';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
      this.router.navigate(['/login']);
      return; // Sortir de la méthode après redirection
    } else if (error.status === 400) {
      errorMessage = 'Invalid data provided. Please check your inputs.';
      if (error.error?.message) {
        errorMessage += '\nDetails: ' + error.error.message;
      }
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    alert(errorMessage);

    // 17. Log additionnel pour debug
    console.log('Request details:');
    console.log('- URL:', this.moduleService.baseUrl);
    console.log('- Headers:', error.headers);
    console.log('- Status:', error.status);
    console.log('- Response:', error.error);

  } finally {
    // 18. Toujours remettre loading à false
    this.isLoading = false;
  }
}

  // Method to check if chapters can be created
  canCreateChapters(): boolean {
    if (!this.createdModule) {
      return false;
    }

    // Check that all chapters have valid titles
    const chapitresValid = this.chapitres.controls.every(chapitre => {
      const titreControl = chapitre.get('titre');
      const lessonsArray = chapitre.get('lessons') as FormArray;

      // Chapter must have a valid title
      if (!titreControl || !titreControl.valid) {
        return false;
      }

      // Each chapter must have at least one valid lesson
      return lessonsArray.controls.every(lesson => {
        const lessonTitre = lesson.get('titre');
        const lessonDescription = lesson.get('description');
        const lessonContenu = lesson.get('contenu');

        return lessonTitre?.valid && lessonDescription?.valid && lessonContenu?.valid;
      });
    });

    return chapitresValid;
  }

  // Create chapters and lessons with enhanced error handling - FIXED
// ========== SOLUTION 1: Modifier createChaptersAndLessons() ==========
// Dans create.component.ts

async createChaptersAndLessons(): Promise<void> {
  if (!this.checkAuthentication()) {
    return;
  }

  if (!this.createdModule || !this.createdModule.id) {
    alert('Course must be created first');
    return;
  }

  if (!this.canCreateChapters()) {
    alert('Please complete all chapter and lesson information before proceeding.');
    this.markAllFieldsAsTouched();
    return;
  }

  this.isLoading = true;

  try {
    const chapitresData = this.courseForm.value.chapitres;

    console.log('=== DEBUG CHAPTER CREATION ===');
    console.log('Module ID:', this.createdModule.id);
    console.log('Number of chapters:', chapitresData.length);

    for (const [chapitreIndex, chapitreData] of chapitresData.entries()) {
      try {
        // ✅ FIX: Vérifier que moduleId est bien défini
        const moduleId = this.createdModule.id;
        
        if (!moduleId) {
          throw new Error('Module ID is undefined');
        }

        // Créer le chapitre avec moduleId
        const chapitre: Chapitre = {
          titre: chapitreData.titre,
          ordre: chapitreData.ordre || (chapitreIndex + 1),
          moduleId: moduleId ,
          lessons: [] // ✅ Utiliser l'ID du module créé
        };

        console.log(`Creating chapter ${chapitreIndex + 1}:`, chapitre);

        // ✅ Appeler le service pour créer le chapitre
        const createdChapitre = await this.chapitreService.addChapitre(chapitre).toPromise();

        console.log('Chapter created:', createdChapitre);

        if (!createdChapitre || !createdChapitre.id) {
          throw new Error('Chapter creation failed - no ID returned');
        }

        // Créer les lessons pour ce chapitre
        if (chapitreData.lessons && chapitreData.lessons.length > 0) {
          for (const [lessonIndex, lessonData] of chapitreData.lessons.entries()) {
            try {
              const lesson: Lesson = {
                titre: lessonData.titre,
                contenu: lessonData.contenu || '',
                description: lessonData.description || '',
                ordre: lessonData.ordre || (lessonIndex + 1),
                duree: lessonData.duree || '00:00:00',
                chapitreId: createdChapitre.id // ✅ Utiliser l'ID du chapitre créé
              };

              console.log(`Creating lesson ${lessonIndex + 1}:`, lesson);

              const createdLesson = await this.lessonService.addLesson(lesson).toPromise();
              
              console.log('Lesson created:', createdLesson);

            } catch (lessonError: any) {
              console.error(`Error creating lesson ${lessonIndex + 1}:`, lessonError);
              throw new Error(`Failed to create lesson "${lessonData.titre}": ${lessonError.message || lessonError}`);
            }
          }
        }

      } catch (chapitreError: any) {
        console.error(`Error creating chapter ${chapitreIndex + 1}:`, chapitreError);
        throw new Error(`Failed to create chapter "${chapitreData.titre}": ${chapitreError.message || chapitreError}`);
      }
    }

    console.log('All chapters and lessons created successfully!');

    // Passer à l'étape de succès
    this.cdkStepper.next();
    this.updateProgressBar();

    // Rediriger après 3 secondes
    setTimeout(() => {
      this.navigateToCourses();
    }, 3000);

  } catch (error: any) {
    console.error('Error creating chapters and lessons:', error);
    let errorMessage = 'Error creating chapters and lessons. Please try again.';

    if (error.status === 403) {
      errorMessage = 'Access forbidden. Please check your permissions.';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
      this.router.navigate(['/login']);
      return;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    alert(errorMessage);
  } finally {
    this.isLoading = false;
  }
}
  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (categories) => {
        this.categoryOptions = categories;
        console.log('Categories loaded:', this.categoryOptions);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        alert('Error loading categories. Please refresh the page.');
      }
    });
  }
}
