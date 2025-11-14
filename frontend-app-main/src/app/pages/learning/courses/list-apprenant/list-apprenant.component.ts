import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Apprenant } from 'src/app/models/apprenant';
import { ApprenantService } from 'src/app/services/apprenant.service';

@Component({
  selector: 'app-apprenant-list',
  templateUrl: './list-apprenant.component.html',
  styleUrls: ['./list-apprenant.component.scss']
})
export class ApprenantListComponent implements OnInit {

  // Références aux modaux
  @ViewChild('editApprenant') editApprenant: any;
  @ViewChild('viewDetailsModal') viewDetailsModal: any;
  @ViewChild('deleteRecordModal') deleteRecordModal: any;

  // Variables principales
  apprenantsList: Apprenant[] = [];
  originalApprenantsList: Apprenant[] = [];
  ListForm!: FormGroup;
  selectedApprenant?: Apprenant;
  deleteID: any;
  term: string = '';
  submitted = false;
  isEditMode = false;

  // Breadcrumb
  breadCrumbItems = [
    { label: 'Tableau de bord', link: '/dashboard' },
    { label: 'Apprenants', active: true }
  ];

  // Configuration Dropzone
  uploadedFiles: any[] = [];
  dropzoneConfig = {
    url: '#', // URL temporaire
    maxFiles: 1,
    acceptedFiles: 'image/*',
    addRemoveLinks: true,
    autoProcessQueue: false
  };

  constructor(
    private fb: FormBuilder,
    private apprenantService: ApprenantService,
    private toastr: ToastrService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadApprenants();
  }

  /**
   * Initialisation du formulaire réactif
   */
  initializeForm(): void {
    this.ListForm = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      niveau: [''],
      adress: [''],
      status: [true],
      photo: ['']
    });
  }

  /**
   * Chargement de la liste des apprenants
   */
 loadApprenants(): void {
  this.apprenantService.getAllApprenants().subscribe({
    next: (data: Apprenant[]) => {
      this.apprenantsList = data.map(apprenant => ({
        ...apprenant,
        enabled: !!apprenant.enabled
      }));
      this.originalApprenantsList = [...this.apprenantsList];
      console.log('status',this.apprenantsList)
    },
    error: (error) => {
      this.toastr.error('Erreur lors du chargement des données', 'Erreur');
    }
  });
}

  /**
   * Filtrage des données selon le terme de recherche
   */
  filterdata(): void {
    if (this.term) {
      this.apprenantsList = this.originalApprenantsList.filter(apprenant =>
        apprenant.firstName.toLowerCase().includes(this.term.toLowerCase()) ||
        apprenant.lastName.toLowerCase().includes(this.term.toLowerCase()) ||
        apprenant.email.toLowerCase().includes(this.term.toLowerCase()) ||
        (apprenant.phone && apprenant.phone.includes(this.term)) ||
        (apprenant.niveau && apprenant.niveau.toLowerCase().includes(this.term.toLowerCase()))
      );
    } else {
      this.apprenantsList = [...this.originalApprenantsList];
    }
  }

  /**
   * Ouvrir le modal d'édition avec les données de l'apprenant
   */
  editList(index: number): void {
    const apprenant = this.apprenantsList[index];
    this.isEditMode = true;
    this.selectedApprenant = apprenant;

    this.ListForm.patchValue({
      id: apprenant.id,
      firstName: apprenant.firstName,
      lastName: apprenant.lastName,
      email: apprenant.email,
      phone: apprenant.phone || '',
      niveau: apprenant.niveau || '',
      adress: apprenant.adress || '',
     status: !!apprenant.enabled,
      photo: apprenant.photo || ''
    });

    // Afficher la photo existante
    if (apprenant.photo) {
      this.uploadedFiles = [{
        name: 'Photo actuelle',
        dataURL: apprenant.photo,
        size: 'Existante'
      }];
    }

    this.editApprenant.show();
  }

  /**
   * Afficher les détails d'un apprenant
   */

  viewDetails(apprenant: Apprenant): void {
    this.selectedApprenant = apprenant;
    this.viewDetailsModal.show();
  }

  /**
   * Sauvegarder les modifications
   */
  saveList(): void {
    this.submitted = true;

    if (this.ListForm.valid) {
      const formData = this.ListForm.value;

      // Ajouter la photo si elle a été téléchargée
      if (this.uploadedFiles.length > 0 && this.uploadedFiles[0].dataURL) {
        formData.photo = this.uploadedFiles[0].dataURL;
      }

      this.apprenantService.updateApprenant(formData.id, formData).subscribe({
        next: (response) => {
          this.toastr.success('Apprenant mis à jour avec succès', 'Succès');
          this.editApprenant.hide();
          this.loadApprenants();
          this.resetForm();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.toastr.error('Erreur lors de la mise à jour', 'Erreur');
        }
      });
    } else {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires', 'Attention');
    }
  }

  /**
   * Basculer le statut d'un apprenant
   */


toggleStatus(id: number, event: any): void {
  const newStatus = event.target.checked;

  this.apprenantService.toggleApprenantStatus(id, newStatus).subscribe({
    next: (updatedApprenant) => {
      // Mettre à jour la liste locale avec la valeur renvoyée par le backend
      const index = this.apprenantsList.findIndex(a => a.id === id);
      if (index !== -1) {
        this.apprenantsList[index].enabled = !!updatedApprenant.enabled;
      }
      this.toastr.success(`Apprenant ${newStatus ? 'activé' : 'désactivé'} avec succès`, 'Succès');
    },
    error: (error) => {
      console.error('Erreur lors du changement de statut:', error);
      // Rétablir la checkbox
      event.target.checked = !newStatus;
      this.toastr.error('Erreur lors du changement de statut', 'Erreur');
    }
  });
}


  /**
   * Préparer la suppression d'un apprenant
   */
  removeItem(id: number): void {
    this.deleteID = id;
    this.deleteRecordModal.show();
  }

  /**
   * Confirmer la suppression
   */
  confirmDelete(id: number): void {
    this.apprenantService.deleteApprenant(id).subscribe({
      next: (response) => {
        this.toastr.success('Apprenant supprimé avec succès', 'Succès');
        this.deleteRecordModal.hide();
        this.loadApprenants();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.toastr.error('Erreur lors de la suppression', 'Erreur');
      }
    });
  }

  /**
   * Gestion de l'upload de fichier (Dropzone)
   */
  onUploadSuccess(event: any): void {
    if (event && event[1]) {
      const file = event[1];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.uploadedFiles = [{
          name: file.name,
          size: this.formatFileSize(file.size),
          dataURL: e.target.result
        }];
      };

      reader.readAsDataURL(file);
    }
  }

  /**
   * Supprimer un fichier téléchargé
   */
  removeFile(file: any): void {
    this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
  }

  /**
   * Formatage de la taille de fichier
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Réinitialiser le formulaire
   */
  private resetForm(): void {
    this.submitted = false;
    this.isEditMode = false;
    this.selectedApprenant = undefined;
    this.uploadedFiles = [];
    this.ListForm.reset({
      status: true
    });
  }

  /**
   * Getter pour faciliter l'accès aux contrôles du formulaire
   */
  get f() {
    return this.ListForm.controls;
  }

  /**
   * Vérifier si un champ a des erreurs
   */
  hasError(field: string): boolean {
    const control = this.ListForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(field: string): string {
    const control = this.ListForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return `${field} est requis`;
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['minlength']) return `${field} doit contenir au moins ${control.errors['minlength'].requiredLength} caractères`;
      if (control.errors['pattern']) return `${field} contient des caractères invalides`;
    }
    return '';
  }
}
