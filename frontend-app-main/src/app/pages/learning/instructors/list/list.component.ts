import { Component, ViewChild, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DecimalPipe } from '@angular/common';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

import { Router } from '@angular/router';
import { Formateur } from 'src/app/models/formateur';
import { FormateurService } from 'src/app/services/formateur.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [DecimalPipe]
})
export class ListComponent implements OnInit {
  endItem: any;
  breadCrumbItems!: Array<{}>;
  files: File[] = [];
  deleteID: any;

  // Propriétés pour les formateurs
  formateursList: Formateur[] = [];
  formateursListCopy: Formateur[] = [];
  formateurs: Formateur[] = [];

  ListForm!: UntypedFormGroup;
  submitted = false;
  masterSelected!: boolean;
    selectedFormateur?: Formateur;


  @ViewChild('addInstructor', { static: false }) addInstructor?: ModalDirective;
  @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal?: ModalDirective;
      @ViewChild('viewDetailsModal') viewDetailsModal: any;


  editData: any;
  term: any;
  isLoading = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private formateurService: FormateurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Formateurs', active: true }
    ];

    // Chart initialization


    // Form initialization
    this.ListForm = this.formBuilder.group({
      id: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      adress: [''],
      phone: [''],
      grade: [''],
      photo: ['']
    });

    this.loadFormateurs();
  }


    viewDetails(formateur: Formateur): void {
      this.selectedFormateur = formateur;
      this.viewDetailsModal.show();
    }


  loadFormateurs() {
    this.isLoading = true;
    document.getElementById('elmLoader')?.classList.remove('d-none');

    this.formateurService.getAllFormateurs().subscribe({
      next: (data) => {
        this.formateursList = data;
        this.formateursListCopy = [...data];
        this.formateurs = data.slice(0, 10);
        this.isLoading = false;
        document.getElementById('elmLoader')?.classList.add('d-none');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des formateurs:', error);
        this.isLoading = false;
        document.getElementById('elmLoader')?.classList.add('d-none');
      }
    });
  }

  // Navigation to create page (supprimée car plus nécessaire)

  // File Upload Configuration
  public dropzoneConfig: DropzoneConfigInterface = {
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false,
  };

  uploadedFiles: any[] = [];
  imageURL: any;

  onUploadSuccess(event: any) {
    setTimeout(() => {
      this.uploadedFiles.push(event[0]);
      this.ListForm.controls['photo'].setValue(event[0].dataURL);
    }, 0);
  }

  removeFile(event: any) {
    this.uploadedFiles.splice(this.uploadedFiles.indexOf(event), 1);
  }

  // Edit Data
  editList(id: any) {
    this.uploadedFiles = [];
    this.addInstructor?.show();
    var modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modaltitle.innerHTML = 'Modifier Formateur';
    var modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
    modalbtn.innerHTML = 'Mettre à jour';

    this.editData = this.formateurs[id];

    if (this.editData.photo) {
      this.uploadedFiles.push({ 'dataURL': this.editData.photo, 'name': 'photo', 'size': 1024 });
    }

    this.ListForm.patchValue({
      id: this.editData.id,
      firstName: this.editData.firstName,
      lastName: this.editData.lastName,
      username: this.editData.username,
      email: this.editData.email,
      adress: this.editData.adress,
      phone: this.editData.phone,
      grade: this.editData.grade,
      photo: this.editData.photo
    });
  }

  // Save/Update formateur
  saveList() {
    if (this.ListForm.valid) {
      const formateurData: Formateur = {
        id: this.ListForm.get('id')?.value || 0,
        firstName: this.ListForm.get('firstName')?.value,
        lastName: this.ListForm.get('lastName')?.value,
        username: this.ListForm.get('username')?.value,
        email: this.ListForm.get('email')?.value,
        password: this.ListForm.get('password')?.value || 'default123',
        adress: this.ListForm.get('adress')?.value,
        phone: this.ListForm.get('phone')?.value,
        grade: this.ListForm.get('grade')?.value,
        photo: this.ListForm.get('photo')?.value
      };

      if (this.ListForm.get('id')?.value) {
        // Update existing formateur
        this.formateurService.updateFormateur(formateurData.id, formateurData).subscribe({
          next: (response) => {
            this.loadFormateurs();
            this.addInstructor?.hide();
            alert('Formateur mis à jour avec succès!');
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            alert('Erreur lors de la mise à jour du formateur');
          }
        });
      }else{
        console.error(  ' error    data formateur ')
      }

      this.ListForm.reset();
      this.uploadedFiles = [];
    }
  }

  checkedValGet: any[] = [];

  // Master checkbox
  checkUncheckAll(ev: any) {
    this.formateurs.forEach((x: any) => x.state = ev.target.checked);
    this.updateCheckedValues();
  }

  // Individual checkbox
  onCheckboxChange(e: any) {
    this.updateCheckedValues();
  }


  private updateCheckedValues() {
    this.checkedValGet = this.formateurs
      .filter((formateur: any) => formateur.state)
      .map(f => f.id);

    const removeActionsEl = document.getElementById("remove-actions");
    if (this.checkedValGet.length > 0) {
      removeActionsEl?.classList.remove('d-none');
    } else {
      removeActionsEl?.classList.add('d-none');
    }
  }

  // Delete formateur
  removeItem(id: any) {
    this.deleteID = id;
    this.deleteRecordModal?.show();
  }

  confirmDelete(id: any) {
    if (id) {
      this.formateurService.deleteFormateur(id).subscribe({
        next: () => {
          this.loadFormateurs();
          alert('Formateur supprimé avec succès!');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          let errorMessage = 'Erreur lors de la suppression du formateur';

          if (error.status === 403) {
            errorMessage = 'Accès refusé. Vous n\'avez pas les permissions pour supprimer ce formateur.';
          } else if (error.status === 404) {
            errorMessage = 'Formateur non trouvé.';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          alert(errorMessage);
        }
      });
    }

    // Delete multiple selected items
    if (this.checkedValGet.length > 0) {
      this.checkedValGet.forEach(formateurId => {
        this.formateurService.deleteFormateur(formateurId).subscribe({
          next: () => {
            console.log('Formateur supprimé:', formateurId);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
      });
      this.loadFormateurs();
      this.checkedValGet = [];
    }

    this.deleteRecordModal?.hide();
    this.masterSelected = false;
  }

  // Sort functionality
  direction: any = 'asc';
  onSort(column: any) {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    const sortedArray = [...this.formateurs];
    sortedArray.sort((a: any, b: any) => {
      const res = this.compare(a[column], b[column]);
      return this.direction === 'asc' ? res : -res;
    });
    this.formateurs = sortedArray;
  }

  compare(v1: string | number, v2: string | number) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }

  // Pagination
  pageChanged(event: any) {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.formateurs = this.formateursList.slice(startItem, this.endItem);
  }

  // Filter functionality
  filterdata() {
    if (this.term) {
      this.formateurs = this.formateursList.filter((el: Formateur) =>
        el.firstName.toLowerCase().includes(this.term.toLowerCase()) ||
        el.lastName.toLowerCase().includes(this.term.toLowerCase()) ||
        el.email.toLowerCase().includes(this.term.toLowerCase()) ||
        el.username.toLowerCase().includes(this.term.toLowerCase())
      );
    } else {
      this.formateurs = this.formateursList.slice(0, 10);
    }
    this.updateNoResultDisplay();
  }

  // No result display
  updateNoResultDisplay() {
    const noResultElement = document.querySelector('.noresult') as HTMLElement;
    const paginationElement = document.getElementById('pagination-element') as HTMLElement;

    if (this.term && this.formateurs.length === 0) {
      noResultElement.style.display = 'block';
      paginationElement.classList.add('d-none');
    } else {
      noResultElement.style.display = 'none';
      paginationElement.classList.remove('d-none');
    }
  }
  openAddModal() {
  this.editData = null;
  this.uploadedFiles = [];
  this.ListForm.reset();
  this.addInstructor?.show();

  const title = document.querySelector('.modal-title') as HTMLElement;
  if (title) title.textContent = 'Ajouter Formateur';
  const btn = document.getElementById('add-btn') as HTMLElement;
  if (btn) btn.textContent = 'Ajouter';
}

goToCreateFormateur(){
this.router.navigate(['/learning/instructors/instructors-create'])

}


}
