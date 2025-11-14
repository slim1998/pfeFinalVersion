import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Categorie } from 'src/app/models/categorie';
import { CategorieService } from 'src/app/services/categorie.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  providers: [DecimalPipe]
})
export class CategoryComponent {
  
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  categories: Categorie[] = [];
  uploadedFiles: any[] = [];
  categorieslist: Categorie[] = [];
  categoryForm!: UntypedFormGroup;
  submitted = false;
  term: any;
  imageFile: File | null = null; // This will hold the actual file
  selectedCategoryId: number | null = null;
  
  @ViewChild('addCategory') addCategory!: any;
  @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal?: ModalDirective;
  
  constructor(
    private categorieService: CategorieService,
    private formBuilder: UntypedFormBuilder
  ) {}
  
  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Courses', active: true },
      { label: 'Category', active: true }
    ];
    
    /**
     * Form Validation
     */
    this.categoryForm = this.formBuilder.group({
      id: [''],
      nom: ['', [Validators.required]],
      description: ['', [Validators.required]],
      image: ['']
    });
    
    // Fetch Data
    this.loadCategories();
  }
  
  loadCategories(): void {
    document.getElementById('elmLoader')?.classList.remove('d-none');
    
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categorieslist = data;
        this.categories = this.categorieslist.slice(0, 15);
        document.getElementById('elmLoader')?.classList.add('d-none');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
        document.getElementById('elmLoader')?.classList.add('d-none');
      }
    });
  }
  
  // File Upload Configuration
  public dropzoneConfig: DropzoneConfigInterface = {
    url: 'https://example.com/upload',
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false,
    autoProcessQueue: false,
    acceptedFiles: 'image/*',
    maxFilesize: 5, // 5MB max
    maxFiles: 1
  };

  // FIXED: Proper file handling
  onFileAdded(file: any) {
    console.log('File added:', file);
    
    // Clear previous files
    this.uploadedFiles = [];
    this.imageFile = null;
    
    // Validate file
    if (!file || !file.type.startsWith('image/')) {
      console.error('Invalid file type');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Store the actual File object for upload
      this.imageFile = file;
      
      // Create preview object for UI
      const previewFile = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        dataURL: e.target.result,
        isExisting: false
      };
      
      this.uploadedFiles = [previewFile];
      console.log('File processed successfully:', this.imageFile);
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    
    reader.readAsDataURL(file);
  }
 
  // File Remove
  removeFile(event: any) {
    this.uploadedFiles.splice(this.uploadedFiles.indexOf(event), 1);
    this.imageFile = null;
    console.log('File removed');
  }
  
  // FIXED: Save Category with proper file handling
  saveCategory() {
    this.submitted = true;
    if (this.categoryForm.invalid) {
      console.log('Form is invalid:', this.categoryForm.errors);
      return;
    }

    const formValue = this.categoryForm.value;
    console.log('Saving category:', formValue);
    console.log('Image file:', this.imageFile);

    const categoryToSave: Categorie = {
      id: formValue.id,
      nom: formValue.nom,
      description: formValue.description,
      image: ''
    };

    if (categoryToSave.id && categoryToSave.id !== 0) {
      // Update existing category
      this.categorieService.updateCategorie(categoryToSave.id, categoryToSave).subscribe({
        next: (updatedCat) => {
          console.log('Category updated:', updatedCat);
          
          if (this.imageFile) {
            console.log('Uploading image for updated category...');
            this.handleImageUpload(updatedCat.id, (updatedWithImage) => {
              this.updateCategoryInList(updatedWithImage);
              this.resetForm();
              this.addCategory?.hide();
            });
          } else {
            this.updateCategoryInList(updatedCat);
            this.resetForm();
            this.addCategory?.hide();
          }
        },
        error: (error) => {
          console.error('Error updating category:', error);
        }
      });
    } else {
      // Create new category
      this.categorieService.addCategorie(categoryToSave).subscribe({
        next: (newCat) => {
          console.log('New category created:', newCat);
          
          if (this.imageFile) {
            console.log('Uploading image for new category...');
            this.handleImageUpload(newCat.id, (newWithImage) => {
              this.categories.push(newWithImage);
              this.categorieslist.push(newWithImage);
              this.resetForm();
              this.addCategory?.hide();
            });
          } else {
            this.categories.push(newCat);
            this.categorieslist.push(newCat);
            this.resetForm();
            this.addCategory?.hide();
          }
        },
        error: (error) => {
          console.error('Error creating category:', error);
        }
      });
    }
  }

  // FIXED: Proper FormData creation
  private handleImageUpload(categorieId: number, callback: (cat: Categorie) => void) {
    if (!this.imageFile) {
      console.error('No image file to upload');
      return;
    }

    console.log('Creating FormData for image upload...');
    console.log('Image file details:', {
      name: this.imageFile.name,
      size: this.imageFile.size,
      type: this.imageFile.type
    });

    const formData = new FormData();
    // Make sure the parameter name matches what the backend expects: 'image'
    formData.append('image', this.imageFile, this.imageFile.name);
    
    // Debug FormData contents
    console.log('FormData contents:');
    // for (let pair of formData.entries()) {
    //   console.log(pair[0], pair[1]);
    // }

    this.categorieService.uploadCategorieImage(categorieId, formData).subscribe({
      next: (updatedCat) => {
        console.log('Image uploaded successfully:', updatedCat);
        callback(updatedCat);
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        // Still call callback with original category if image upload fails
        const originalCat = this.categories.find(c => c.id === categorieId);
        if (originalCat) {
          callback(originalCat);
        }
      }
    });
  }

  private updateCategoryInList(updatedCat: Categorie) {
    const index = this.categories.findIndex(c => c.id === updatedCat.id);
    if (index !== -1) {
      this.categories[index] = updatedCat;
    }
    
    const listIndex = this.categorieslist.findIndex(c => c.id === updatedCat.id);
    if (listIndex !== -1) {
      this.categorieslist[listIndex] = updatedCat;
    }
  }
  
  // Reset form
  resetForm() {
    this.categoryForm.reset();
    this.uploadedFiles = [];
    this.imageFile = null;
    this.submitted = false;
    console.log('Form reset');
  }
  
  // Edit Category
  editCategory(category: Categorie) {
    console.log('Editing category:', category);
    
    this.categoryForm.patchValue({
      id: category.id,
      nom: category.nom,
      description: category.description,
      image: category.image
    });

    this.uploadedFiles = [];
    this.imageFile = null; // Reset file when editing
    
    if (category.image) {
      this.uploadedFiles.push({
        name: 'Image actuelle',
        size: '',
        dataURL: category.image,
        isExisting: true
      });
    }

    this.addCategory?.show();
  }
  
  // Delete Category
  confirmDelete(id: number) {
    this.selectedCategoryId = id;
    this.deleteRecordModal?.show();
  }
  
  deleteCategory() {
    if (this.selectedCategoryId) {
      this.categorieService.deleteCategorie(this.selectedCategoryId).subscribe({
        next: () => {
          this.loadCategories();
          this.deleteRecordModal?.hide();
          this.selectedCategoryId = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
  
  // Filter data
  filterdata() {
    if (this.term) {
      this.categories = this.categorieslist.filter((el: Categorie) => 
        el.nom.toLowerCase().includes(this.term.toLowerCase()) ||
        el.description.toLowerCase().includes(this.term.toLowerCase())
      );
    } else {
      this.categories = this.categorieslist.slice(0, 15);
    }
    this.updateNoResultDisplay();
  }
  
  // No result display
  updateNoResultDisplay() {
    const noResultElement = document.querySelector('.noresult') as HTMLElement;
    const paginationElement = document.getElementById('pagination-element') as HTMLElement;
    
    if (this.term && this.categories.length === 0) {
      noResultElement.style.display = 'block';
      paginationElement?.classList.add('d-none');
    } else {
      noResultElement.style.display = 'none';
      paginationElement?.classList.remove('d-none');
    }
  }
  
  // Page Changed
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.categories = this.categorieslist.slice(startItem, endItem);
  }
  
  // Get validation classes
  getValidationClass(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field && this.submitted) {
      return field.invalid ? 'is-invalid' : 'is-valid';
    }
    return '';
  }
  
  // Check if field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }
}