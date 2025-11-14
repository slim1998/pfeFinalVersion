import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Formateur } from 'src/app/models/formateur';
import { FormateurService } from 'src/app/services/formateur.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  formateurForm!: FormGroup;
  isSubmitting = false;
  role!: string;
  mode!: 'ADD' | 'EDIT';
  currentFormateurId?: number;
  imagePreview?: string;
   breadCrumbItems = [
    { label: 'Formateurs', active: true },
    { label: this.mode === 'ADD' ? 'Ajouter Formateur' : 'Modifier Profil', active: true }
  ];

  constructor(
    private fb: FormBuilder,
    private formateurService: FormateurService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // récupération role depuis localStorage
    this.role = localStorage.getItem('role') || '';

    // déterminer mode
    this.mode = this.role === 'FORMATEUR' ? 'EDIT' : 'ADD';

    this.initializeForm();

    if (this.mode === 'EDIT') {
      this.loadFormateurProfil();
    }
  }

  initializeForm() {
    this.formateurForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        this.mode === 'ADD' ? [Validators.required, Validators.minLength(6)] : []
      ],
      adress: [''],
      phone: [''],
      grade: [''],
      photo: ['']
    });
  }

  loadFormateurProfil() {
    const userId = localStorage.getItem('userId'); // id du formateur connecté
    if (userId) {
      this.formateurService.getFormateurByid(userId).subscribe(formateur => {
        this.currentFormateurId = formateur.id;
        this.formateurForm.patchValue(formateur);
        if (formateur.photo) {
          this.imagePreview = formateur.photo;
        }
      });
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.formateurForm.patchValue({ photo: this.imagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = undefined;
    this.formateurForm.patchValue({ photo: '' });
  }

  onSubmit() {
    if (this.formateurForm.invalid) return;

    this.isSubmitting = true;
    const formateur: Formateur = this.formateurForm.value;

    if (this.mode === 'ADD') {
      this.formateurService.addFormateur(formateur).subscribe({
        next: () => {
          this.toastr.success('Formateur ajouté avec succès');
          this.router.navigate(['/formateurs']);
        },
        error: () => {
          this.isSubmitting = false;
          this.toastr.error("Erreur lors de l’ajout du formateur");
        }
      });
    } else {
      if (this.currentFormateurId) {
        this.formateurService
          .updateFormateur(this.currentFormateurId, formateur)
          .subscribe({
            next: () => {
              this.toastr.success('Profil mis à jour avec succès');
              this.router.navigate(['/profil']);
            },
            error: () => {
              this.isSubmitting = false;
              this.toastr.error("Cet email existe déjà, veuillez en choisir un autre.");
            }
          });
      }
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  // Helpers pour erreurs
  isFieldInvalid(field: string): boolean {
    const control = this.formateurForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(field: string): string {
    const control = this.formateurForm.get(field);
    if (control?.errors?.['required']) return 'Ce champ est obligatoire';
    if (control?.errors?.['email']) return 'Email invalide';
    if (control?.errors?.['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    return '';
  }
}
