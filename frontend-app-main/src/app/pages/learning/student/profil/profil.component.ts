// ========== apprenant-profile.component.ts ==========
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApprenantService } from 'src/app/services/apprenant.service';
import { Apprenant } from 'src/app/models/apprenant';
import Swal from 'sweetalert2';

@Component({
  selector: 'profil.component',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  // Données de l'apprenant
  apprenant: Apprenant = new Apprenant();
  userId!: number;
  
  // Formulaires
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  emailForm!: FormGroup;
  
  // États de l'interface
  isEditingProfile = false;
  isChangingPassword = false;
  isChangingEmail = false;
  isUploadingImage = false;
  
  // Image
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  defaultAvatar = 'assets/images/default-avatar.png';
  
  // Loading states
  loadingProfile = false;
  loadingPassword = false;
  loadingEmail = false;

  constructor(
    private apprenantService: ApprenantService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID depuis localStorage
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      this.userId = parseInt(userIdStr, 10);
      this.loadApprenantData();
    }
    
    this.initForms();
  }

  // ========== INITIALISATION DES FORMULAIRES ==========
  
  initForms(): void {
    // Formulaire profil
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.pattern(/^[0-9]{8,15}$/)]],
      adress: [''],
      niveau: ['', Validators.required]
    });

    // Formulaire mot de passe
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Formulaire email
    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]]
    });
  }

  // Validateur personnalisé pour confirmer le mot de passe
  passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  // ========== CHARGEMENT DES DONNÉES ==========
  
  loadApprenantData(): void {
    this.apprenantService.getApprenantByid(this.userId).subscribe({
      next: (data) => {
        this.apprenant = data;
        this.populateProfileForm();
        this.imagePreview = this.apprenant.photo || this.defaultAvatar;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil:', err);
        Swal.fire('Erreur', 'Impossible de charger les données du profil', 'error');
      }
    });
  }

  populateProfileForm(): void {
    this.profileForm.patchValue({
      firstName: this.apprenant.firstName,
      lastName: this.apprenant.lastName,
      phone: this.apprenant.phone,
      adress: this.apprenant.adress,
      niveau: this.apprenant.niveau
    });
  }

  // ========== GESTION DE LA PHOTO ==========
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        Swal.fire('Erreur', 'Veuillez sélectionner une image valide', 'error');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Erreur', 'L\'image ne doit pas dépasser 5 MB', 'error');
        return;
      }

      this.selectedFile = file;

      // Prévisualisation
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      Swal.fire('Attention', 'Veuillez sélectionner une image', 'warning');
      return;
    }

    this.isUploadingImage = true;
    
    this.apprenantService.uploadApprenantImage(this.userId, this.selectedFile).subscribe({
      next: (response) => {
        this.isUploadingImage = false;
        Swal.fire('Succès', 'Photo de profil mise à jour avec succès', 'success');
        this.loadApprenantData(); // Recharger les données
        this.selectedFile = null;
      },
      error: (err) => {
        this.isUploadingImage = false;
        console.error('Erreur upload image:', err);
        Swal.fire('Erreur', 'Échec de l\'upload de l\'image', 'error');
      }
    });
  }

  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = this.apprenant.photo || this.defaultAvatar;
  }

  // ========== MISE À JOUR DU PROFIL ==========
  
  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile) {
      this.populateProfileForm(); // Réinitialiser si annulation
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.loadingProfile = true;
    
    // Fusionner les données
    const updatedApprenant = {
      ...this.apprenant,
      ...this.profileForm.value
    };

    this.apprenantService.updateApprenant(this.userId, updatedApprenant).subscribe({
      next: (response) => {
        this.loadingProfile = false;
        this.apprenant = response;
        this.isEditingProfile = false;
        
        // Mettre à jour le fullName dans localStorage si modifié
        const fullName = `${response.firstName} ${response.lastName}`;
        localStorage.setItem('fullName', fullName);
        
        Swal.fire('Succès', 'Profil mis à jour avec succès', 'success');
      },
      error: (err) => {
        this.loadingProfile = false;
        console.error('Erreur mise à jour profil:', err);
        Swal.fire('Erreur', 'Échec de la mise à jour du profil', 'error');
      }
    });
  }

  // ========== CHANGEMENT DE MOT DE PASSE ==========
  
  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.loadingPassword = true;

    this.apprenantService.changePassword(this.userId, currentPassword, newPassword).subscribe({
      next: () => {
        this.loadingPassword = false;
        this.passwordForm.reset();
        this.isChangingPassword = false;
        Swal.fire('Succès', 'Mot de passe modifié avec succès', 'success');
      },
      error: (err) => {
        this.loadingPassword = false;
        console.error('Erreur changement mot de passe:', err);
        const message = err.error?.message || 'Mot de passe actuel incorrect';
        Swal.fire('Erreur', message, 'error');
      }
    });
  }

  // ========== CHANGEMENT D'EMAIL ==========
  
  toggleEmailChange(): void {
    this.isChangingEmail = !this.isChangingEmail;
    if (!this.isChangingEmail) {
      this.emailForm.reset();
    }
  }

  changeEmail(): void {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched(this.emailForm);
      return;
    }

    const newEmail = this.emailForm.get('newEmail')?.value;
    this.loadingEmail = true;

    this.apprenantService.updateEmail(this.userId, newEmail).subscribe({
      next: () => {
        this.loadingEmail = false;
        this.apprenant.email = newEmail;
        localStorage.setItem('userEmail', newEmail);
        this.emailForm.reset();
        this.isChangingEmail = false;
        Swal.fire('Succès', 'Email modifié avec succès', 'success');
      },
      error: (err) => {
        this.loadingEmail = false;
        console.error('Erreur changement email:', err);
        const message = err.error?.message || 'Cet email est déjà utilisé';
        Swal.fire('Erreur', message, 'error');
      }
    });
  }

  // ========== UTILITAIRES ==========
  
  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters pour les messages d'erreur
  get firstNameErrors(): string {
    const control = this.profileForm.get('firstName');
    if (control?.hasError('required')) return 'Le prénom est requis';
    if (control?.hasError('minlength')) return 'Minimum 2 caractères';
    return '';
  }

  get lastNameErrors(): string {
    const control = this.profileForm.get('lastName');
    if (control?.hasError('required')) return 'Le nom est requis';
    if (control?.hasError('minlength')) return 'Minimum 2 caractères';
    return '';
  }

  get phoneErrors(): string {
    const control = this.profileForm.get('phone');
    if (control?.hasError('pattern')) return 'Numéro de téléphone invalide';
    return '';
  }

  get currentPasswordErrors(): string {
    const control = this.passwordForm.get('currentPassword');
    if (control?.hasError('required')) return 'Mot de passe actuel requis';
    return '';
  }

  get newPasswordErrors(): string {
    const control = this.passwordForm.get('newPassword');
    if (control?.hasError('required')) return 'Nouveau mot de passe requis';
    if (control?.hasError('minlength')) return 'Minimum 6 caractères';
    return '';
  }

  get confirmPasswordErrors(): string {
    const control = this.passwordForm.get('confirmPassword');
    if (control?.hasError('required')) return 'Confirmation requise';
    if (this.passwordForm.hasError('mismatch')) return 'Les mots de passe ne correspondent pas';
    return '';
  }

  get emailErrors(): string {
    const control = this.emailForm.get('newEmail');
    if (control?.hasError('required')) return 'Email requis';
    if (control?.hasError('email')) return 'Email invalide';
    return '';
  }
}