import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuestionResponseDto, QuizDto, QuizResponseDto } from 'src/app/models/quiz';
import { QuizService } from 'src/app/services/quiz.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Module } from 'src/app/models/module';
import { ModuleService } from 'src/app/services/module.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent {
  @ViewChild('createQuizModal') createQuizModalTemplate!: TemplateRef<any>; 

  currentModal?: BsModalRef;
  formationId?: number;

  quizzes: QuizResponseDto[] = [];
  currentQuiz: QuizResponseDto | null = null;
  currentQuestionIndex: number = -1;
  listFormation: Module[] = [];

  // Forms
  quizForm: FormGroup;
  questionForm: FormGroup;

  // Loading states
  loading = false;
  saving = false;

  // Chapter quiz management
  quizzesByChapitres: Map<number, QuizResponseDto[]> = new Map();
  currentChapitreId?: number;
  selectedChapitre?: any;
  isChapterQuiz: boolean = false;

  // Formation quiz management
  quizzesByFormation: Map<number, QuizResponseDto[]> = new Map();
  selectedFormation?: Module;

  constructor(
    private quizService: QuizService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private moduleService: ModuleService,
    private modalService: BsModalService
  ) {
    this.quizForm = this.createQuizForm();
    this.questionForm = this.createQuestionForm();
  }

  ngOnInit() {
    this.getAllModule();
  }

  getAllModule() {
    this.moduleService.getAllModule().subscribe({
      next: (modules) => {
        this.listFormation = modules;
        console.log("=== MODULES CHARGÉS ===");
        console.log("Nombre de formations:", modules.length);
        
        // Charger les quiz APRÈS avoir les formations
        this.loadAllQuizzesForFormations();
        this.loadAllQuizzesForChapters();
        
        // Vérifier l'état après un délai
        setTimeout(() => {
          console.log("=== ÉTAT DE LA MAP APRÈS CHARGEMENT ===");
          this.quizzesByFormation.forEach((quizzes, formationId) => {
            console.log(`Formation ${formationId}: ${quizzes.length} quiz(s)`);
          });
        }, 2000);
      },
      error: (err) => {
        console.error("Erreur chargement modules :", err);
      }
    });
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  // Form creation methods
  private createQuizForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      questions: this.fb.array([])
    });
  }

  private createQuestionForm(): FormGroup {
    return this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      points: [1, [Validators.required, Validators.min(1)]],
      answerOptions: this.fb.array([
        this.createAnswerOption('', false),
        this.createAnswerOption('', false),
        this.createAnswerOption('', false),
        this.createAnswerOption('', false)
      ])
    });
  }

  private createAnswerOption(text: string = '', correct: boolean = false) {
    return this.fb.group({
      text: [text, Validators.required],
      correct: [correct]
    });
  }

  // Getters for form arrays
  get questionsArray(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  get answerOptionsArray(): FormArray {
    return this.questionForm.get('answerOptions') as FormArray;
  }

  // Form population methods
  private populateQuizForm(quiz: QuizResponseDto) {
    this.quizForm.patchValue({
      title: quiz.title,
      description: quiz.description || ''
    });

    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }

    quiz.questions.forEach(question => {
      const questionGroup = this.fb.group({
        text: [question.text, Validators.required],
        points: [question.points, [Validators.required, Validators.min(1)]],
        answerOptions: this.fb.array(
          question.options.map(option => this.fb.group({
            text: [option.text, Validators.required],
            correct: [option.correct]
          }))
        )
      });
      this.questionsArray.push(questionGroup);
    });
  }

  private populateQuestionForm(question: QuestionResponseDto) {
    this.questionForm.patchValue({
      text: question.text,
      points: question.points
    });

    while (this.answerOptionsArray.length !== 0) {
      this.answerOptionsArray.removeAt(0);
    }

    question.options.forEach(option => {
      this.answerOptionsArray.push(this.fb.group({
        text: [option.text, Validators.required],
        correct: [option.correct]
      }));
    });
  }

  // Modal methods
  openCreateQuestionModal(content: TemplateRef<any>) {
    this.currentQuestionIndex = -1;
    this.questionForm.reset();
    
    while (this.answerOptionsArray.length !== 0) {
      this.answerOptionsArray.removeAt(0);
    }
    for (let i = 0; i < 4; i++) {
      this.answerOptionsArray.push(this.createAnswerOption());
    }
    
    this.currentModal = this.modalService.show(content, { 
      class: 'modal-lg',
      ignoreBackdropClick: true 
    });
  }

  openEditQuestionModal(content: TemplateRef<any>, questionIndex: number) {
    this.currentQuestionIndex = questionIndex;
    const question = this.questionsArray.at(questionIndex).value;
    this.populateQuestionForm({
      id: questionIndex,
      text: question.text,
      points: question.points,
      options: question.answerOptions
    });
    
    this.currentModal = this.modalService.show(content, { 
      class: 'modal-lg',
      ignoreBackdropClick: true 
    });
  }

  openCreateQuizModal(formationId: number) {
    // Plus besoin de vérification car le bouton n'est affiché que si aucun quiz n'existe
    this.formationId = formationId;
    this.selectedFormation = this.listFormation.find(f => f.id === formationId);
    this.isChapterQuiz = false;

    this.quizForm.reset();
    this.quizForm.patchValue({ title: '', description: '' });
    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }
    this.currentQuiz = null;

    this.currentModal = this.modalService.show(this.createQuizModalTemplate, {
      class: 'modal-xl',
      ignoreBackdropClick: true
    });
  }

  async openEditQuizModal(content: TemplateRef<any>, quizId: number, formationId: number) {
    this.formationId = formationId;
    this.selectedFormation = this.listFormation.find(f => f.id === formationId);
    this.isChapterQuiz = false;

    await this.loadQuizById(quizId);
    
    this.currentModal = this.modalService.show(content, { 
      class: 'modal-xl',
      ignoreBackdropClick: true 
    });
  }

  openCreateChapterQuizModal(content: TemplateRef<any>, chapitreId: number, formationId: number) {
    this.currentChapitreId = chapitreId;
    this.formationId = formationId;
    this.selectedFormation = this.listFormation.find(f => f.id === formationId);
    this.selectedChapitre = this.selectedFormation?.chapitres?.find(c => c.id === chapitreId);
    this.isChapterQuiz = true;

    this.quizForm.reset();
    this.quizForm.patchValue({
      title: '',
      description: ''
    });

    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }

    this.currentQuiz = null;
    
    this.currentModal = this.modalService.show(content, { 
      class: 'modal-xl',
      ignoreBackdropClick: true 
    });
  }

  async openEditChapterQuizModal(content: TemplateRef<any>, quizId: number, chapitreId: number, formationId: number) {
    this.currentChapitreId = chapitreId;
    this.formationId = formationId;
    this.selectedFormation = this.listFormation.find(f => f.id === formationId);
    this.selectedChapitre = this.selectedFormation?.chapitres?.find(c => c.id === chapitreId);
    this.isChapterQuiz = true;

    try {
      await this.loadChapterQuizById(quizId, chapitreId);
      this.currentModal = this.modalService.show(content, { 
        class: 'modal-xl',
        ignoreBackdropClick: true 
      });
    } catch (error) {
      console.error('Error opening edit modal:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l\'ouverture du modal de modification'
      });
    }
  }

  closeModal(): void {
    if (this.currentModal) {
      this.currentModal.hide();
      this.currentModal = undefined;
    }
  }

  // Question management within quiz form
  addQuestion() {
    if (this.questionForm.valid) {
      const questionData = this.questionForm.value;

      const hasCorrectAnswer = questionData.answerOptions.some((option: any) => option.correct);
      if (!hasCorrectAnswer) {
        Swal.fire({
          icon: 'warning',
          title: 'Réponse manquante',
          text: 'Veuillez sélectionner au moins une réponse correcte'
        });
        return;
      }

      const questionGroup = this.fb.group({
        text: [questionData.text, Validators.required],
        points: [questionData.points, [Validators.required, Validators.min(1)]],
        answerOptions: this.fb.array(
          questionData.answerOptions.map((option: any) => this.fb.group({
            text: [option.text, Validators.required],
            correct: [option.correct]
          }))
        )
      });

      this.questionsArray.push(questionGroup);
      this.currentModal?.hide();
    }
  }

  updateQuestion(questionIndex: number = this.currentQuestionIndex) {
    if (this.questionForm.valid && questionIndex >= 0) {
      const questionData = this.questionForm.value;

      const hasCorrectAnswer = questionData.answerOptions.some((option: any) => option.correct);
      if (!hasCorrectAnswer) {
        Swal.fire({
          icon: 'warning',
          title: 'Réponse manquante',
          text: 'Veuillez sélectionner au moins une réponse correcte'
        });
        return;
      }

      const questionGroup = this.questionsArray.at(questionIndex) as FormGroup;
      questionGroup.patchValue({
        text: questionData.text,
        points: questionData.points
      });

      const optionsArray = questionGroup.get('answerOptions') as FormArray;
      while (optionsArray.length !== 0) {
        optionsArray.removeAt(0);
      }

      questionData.answerOptions.forEach((option: any) => {
        optionsArray.push(this.fb.group({
          text: [option.text, Validators.required],
          correct: [option.correct]
        }));
      });

      this.currentModal?.hide();
    }
  }

  removeQuestion(index: number) {
    Swal.fire({
      title: 'Supprimer la question ?',
      text: "Cette action est irréversible",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.questionsArray.removeAt(index);
      }
    });
  }

  // Answer option management
  addAnswerOption() {
    if (this.answerOptionsArray.length < 6) {
      this.answerOptionsArray.push(this.createAnswerOption());
    }
  }

  removeAnswerOption(index: number) {
    if (this.answerOptionsArray.length > 2) {
      this.answerOptionsArray.removeAt(index);
    }
  }

  onCorrectAnswerChange(index: number, isMultipleChoice: boolean = false) {
    if (!isMultipleChoice) {
      this.answerOptionsArray.controls.forEach((control, i) => {
        if (i !== index) {
          control.patchValue({ correct: false });
        }
      });
    }
  }

  // Utility methods
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['min']) return `La valeur minimum est ${field.errors['min'].min}`;
    }
    return '';
  }

  // Quiz management for formations
  loadAllQuizzesForFormations() {
    this.listFormation.forEach(formation => {
      if (!formation.id) return;
      
      this.quizService.getquizbymoduleid(formation.id).subscribe({
        next: quizzes => {
          console.log(`Quizzes chargés pour formation ${formation.id}:`, quizzes);
          const quizList = Array.isArray(quizzes) ? quizzes : (quizzes ? [quizzes] : []);
          this.quizzesByFormation.set(formation.id!, quizList);
          console.log(`Map mis à jour - Formation ${formation.id} a ${quizList.length} quiz`);
          this.cdr.detectChanges();
        },
        error: err => {
          console.error(`Erreur chargement quiz formation ${formation.id}:`, err);
          this.quizzesByFormation.set(formation.id!, []);
          this.cdr.detectChanges();
        }
      });
    });
  }

  getQuizzesForFormation(formationId: number): QuizResponseDto[] {
    const quizzes = this.quizzesByFormation.get(formationId) || [];
    console.log(`getQuizzesForFormation(${formationId}):`, quizzes);
    return quizzes;
  }

  hasQuizzes(formationId: number): boolean {
    const quizzes = this.quizzesByFormation.get(formationId) || [];
    const hasQuiz = quizzes.length > 0;
    console.log(`hasQuizzes(${formationId}): ${hasQuiz}, count: ${quizzes.length}`);
    return hasQuiz;
  }

  // Méthode de debug à appeler depuis le template
  debugFormationQuizzes(formationId: number): void {
    console.log("=== DEBUG FORMATION QUIZZES ===");
    console.log("Formation ID:", formationId);
    console.log("Map contient la clé?", this.quizzesByFormation.has(formationId));
    console.log("Quizzes:", this.quizzesByFormation.get(formationId));
    console.log("hasQuizzes():", this.hasQuizzes(formationId));
    console.log("Toute la Map:", Array.from(this.quizzesByFormation.entries()));
    console.log("===========================");
  }

  async loadQuizById(quizId: number) {
    try {
      this.currentQuiz = await this.quizService.getByIdWithModule(this.formationId!, quizId).toPromise() || null;
      if (this.currentQuiz) {
        this.populateQuizForm(this.currentQuiz);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  }

  loadQuizzesForFormation(formationId: number) {
    if (!formationId) {
      console.error('Formation ID is missing');
      return;
    }

    this.quizService.getquizbymoduleid(formationId).subscribe({
      next: quizzes => {
        const quizList = quizzes || [];
        this.quizzesByFormation.set(formationId, quizList);
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(`Error loading quizzes for formation ${formationId}:`, err);
        if (err.status === 404) {
          this.quizzesByFormation.set(formationId, []);
          this.cdr.detectChanges();
        }
      }
    });
  }

  async saveQuiz() {
    if (this.isChapterQuiz) {
      await this.saveChapterQuiz();
      return;
    }

    if (!this.quizForm.valid) {
      this.markFormGroupTouched(this.quizForm);
      return;
    }

    if (this.questionsArray.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Questions manquantes',
        text: 'Veuillez ajouter au moins une question au quiz'
      });
      return;
    }

    if (!this.formationId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Formation non sélectionnée'
      });
      return;
    }

    this.saving = true;
    try {
      const quizData: QuizDto = {
        title: this.quizForm.value.title,
        description: this.quizForm.value.description,
        questions: this.quizForm.value.questions.map((q: any) => ({
          text: q.text,
          points: q.points,
          answerOptions: q.answerOptions.map((option: any) => ({
            text: option.text,
            correct: option.correct
          }))
        }))
      };

      let savedQuiz: QuizResponseDto | undefined;

      if (this.currentQuiz) {
        savedQuiz = await this.quizService.update(this.formationId!, this.currentQuiz.id, quizData).toPromise();
      } else {
        savedQuiz = await this.quizService.createFinalQuizForModule(this.formationId!, quizData).toPromise();
      }

      if (savedQuiz) {
        const currentQuizzes = this.quizzesByFormation.get(this.formationId!) || [];

        if (this.currentQuiz) {
          const index = currentQuizzes.findIndex(q => q.id === this.currentQuiz!.id);
          if (index !== -1) {
            currentQuizzes[index] = savedQuiz;
          }
        } else {
          currentQuizzes.push(savedQuiz);
        }

        this.quizzesByFormation.set(this.formationId!, [...currentQuizzes]);
      }

      this.cdr.detectChanges();

      setTimeout(() => {
        this.loadQuizzesForFormation(this.formationId!);
      }, 100);

      this.currentModal?.hide();
      
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: this.currentQuiz ? 'Quiz modifié avec succès' : 'Quiz créé avec succès',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error saving quiz:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la sauvegarde du quiz'
      });
    } finally {
      this.saving = false;
    }
  }

  async deleteQuiz(quizId: number, formationId: number) {
    const result = await Swal.fire({
      title: 'Supprimer le quiz module ?',
      html: `
        <p>Cette action supprimera définitivement ce quiz et toutes ses questions.</p>
        <p class="text-muted mb-0"><strong>Cette action est irréversible.</strong></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="bi bi-trash-fill me-2"></i>Oui, supprimer',
      cancelButtonText: '<i class="bi bi-x-circle me-2"></i>Annuler',
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary'
      }
    });

    if (result.isConfirmed) {
      try {
        await this.quizService.delete(formationId, quizId).toPromise();

        const currentQuizzes = this.quizzesByFormation.get(formationId) || [];
        const updatedQuizzes = currentQuizzes.filter(quiz => quiz.id !== quizId);
        this.quizzesByFormation.set(formationId, updatedQuizzes);

        this.cdr.detectChanges();

        setTimeout(() => {
          this.loadQuizzesForFormation(formationId);
        }, 100);

        Swal.fire({
          icon: 'success',
          title: 'Quiz supprimé !',
          text: 'Le quiz module a été supprimé avec succès',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });

      } catch (error) {
        console.error('Error deleting quiz:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de supprimer le quiz. Veuillez réessayer.',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  }

  // Chapter quiz management
  getQuizzesForChapitre(chapitreId: number): QuizResponseDto[] {
    return this.quizzesByChapitres.get(chapitreId) || [];
  }

  hasChapterQuizzes(chapitreId: number): boolean {
    const quizzes = this.getQuizzesForChapitre(chapitreId);
    return quizzes.length > 0;
  }

  loadAllQuizzesForChapters() {
    this.listFormation.forEach(formation => {
      if (formation.chapitres && formation.chapitres.length > 0) {
        formation.chapitres.forEach(chapitre => {
          this.loadQuizzesForChapitre(chapitre.id!);
        });
      }
    });
  }

  getTotalChapterQuizzes(formation: any): number {
    if (!formation.chapitres || formation.chapitres.length === 0) {
      return 0;
    }

    let total = 0;
    formation.chapitres.forEach((chapitre: any) => {
      if (chapitre.id) {
        total += this.getQuizzesForChapitre(chapitre.id).length;
      }
    });

    return total;
  }

  loadQuizzesForChapitre(chapitreId: number) {
    if (!chapitreId) return;

    this.quizService.getQuizzeByChapitreId(chapitreId).subscribe({
      next: (quizzes: QuizResponseDto[]) => {
        this.quizzesByChapitres.set(chapitreId, quizzes);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement quiz:', err);
        this.quizzesByChapitres.set(chapitreId, []);
        this.cdr.detectChanges();
      }
    });
  }

  async saveChapterQuiz() {
    if (!this.quizForm.valid) {
      this.markFormGroupTouched(this.quizForm);
      return;
    }

    if (this.questionsArray.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Questions manquantes',
        text: 'Veuillez ajouter au moins une question au quiz'
      });
      return;
    }

    if (!this.currentChapitreId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Chapitre non sélectionné'
      });
      return;
    }

    const chapitreId = Number(this.currentChapitreId);
    if (isNaN(chapitreId) || chapitreId <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID de chapitre invalide: ' + this.currentChapitreId
      });
      return;
    }

    this.saving = true;
    try {
      const quizData: QuizDto = {
        title: this.quizForm.value.title,
        description: this.quizForm.value.description,
        questions: this.quizForm.value.questions.map((q: any) => ({
          text: q.text,
          points: q.points,
          answerOptions: q.answerOptions.map((option: any) => ({
            text: option.text,
            correct: option.correct
          }))
        }))
      };

      if (this.currentQuiz && this.currentQuiz.id) {
        try {
          await this.quizService.updateQuizForChapitre(chapitreId, this.currentQuiz.id, quizData).toPromise();
        } catch (updateError) {
          if (this.formationId) {
            await this.quizService.update(this.formationId, this.currentQuiz.id, quizData).toPromise();
          } else {
            throw updateError;
          }
        }
      } else {
        await this.quizService.createQuizForChapitre(chapitreId, quizData).toPromise();
      }

      setTimeout(() => {
        this.loadQuizzesForChapitre(chapitreId);
      }, 300);

      this.currentModal?.hide();

      this.isChapterQuiz = false;
      this.currentQuiz = null;

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: this.currentQuiz ? 'Quiz modifié avec succès' : 'Quiz créé avec succès',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error saving chapter quiz:', error);

      let errorMessage = 'Erreur inconnue';
      if (error && typeof error === 'object') {
        if ((error as any).error?.message) {
          errorMessage = (error as any).error.message;
        } else if ((error as any).message) {
          errorMessage = (error as any).message;
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la sauvegarde du quiz de chapitre: ' + errorMessage
      });
    } finally {
      this.saving = false;
    }
  }

  async loadChapterQuizById(quizId: number, chapitreId: number) {
    try {
      try {
        this.currentQuiz = await this.quizService.getQuizByChapitreAndId(chapitreId, quizId).toPromise() || null;
      } catch (error) {
        this.currentQuiz = await this.quizService.getById(quizId).toPromise() || null;
      }

      if (this.currentQuiz) {
        this.populateQuizForm(this.currentQuiz);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Quiz non trouvé'
        });
      }
    } catch (error) {
      console.error('Error loading chapter quiz:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement du quiz'
      });
    }
  }

  async deleteChapterQuiz(quizId: number, chapitreId: number) {
    if (!quizId || !chapitreId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Données manquantes pour la suppression'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Supprimer le quiz ?',
      text: "Cette action est irréversible",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        try {
          await this.quizService.deleteQuizForChapitre(chapitreId, quizId).toPromise();
        } catch (deleteError) {
          if (this.formationId) {
            await this.quizService.delete(this.formationId, quizId).toPromise();
          } else {
            throw deleteError;
          }
        }

        await this.loadQuizzesForChapitre(chapitreId);
        
        Swal.fire({
          icon: 'success',
          title: 'Supprimé',
          text: 'Quiz supprimé avec succès',
          timer: 2000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error('Error deleting chapter quiz:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression du quiz de chapitre'
        });
      }
    }
  }

  // Utility methods
  getTotalPoints(questions: any[]): number {
    if (!questions || questions.length === 0) {
      return 0;
    }

    return questions.reduce((total, question) => {
      return total + (question.points || 1);
    }, 0);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getEstimatedDuration(questions: any[]): string {
    if (!questions || questions.length === 0) {
      return '0 min';
    }

    const minutes = Math.max(1, Math.ceil(questions.length * 1));

    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes > 0 ? remainingMinutes + 'min' : ''}`;
    }
  }

  getDifficultyLevel(questions: any[]): { level: string, color: string, icon: string } {
    if (!questions || questions.length === 0) {
      return { level: 'Aucune', color: 'text-muted', icon: 'bi-question' };
    }

    const totalPoints = this.getTotalPoints(questions);
    const avgPointsPerQuestion = totalPoints / questions.length;

    if (avgPointsPerQuestion <= 1) {
      return { level: 'Facile', color: 'text-success', icon: 'bi-1-circle' };
    } else if (avgPointsPerQuestion <= 3) {
      return { level: 'Moyen', color: 'text-warning', icon: 'bi-2-circle' };
    } else {
      return { level: 'Difficile', color: 'text-danger', icon: 'bi-3-circle' };
    }
  }
}