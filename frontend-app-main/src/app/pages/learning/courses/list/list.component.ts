import { Component, OnInit,ViewChild } from '@angular/core';
import { ModuleService } from 'src/app/services/module.service';
import { Module } from 'src/app/models/module';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  breadCrumbItems!: Array<{}>;
  term: string = '';
  modules: Module[] = [];
  moduleList: Module[] = [];
  endItem!: number;
  masterSelected = false;
  checkedValGet: number[] = [];
  loading: boolean = true;

  deleteID?: number;
  direction: 'asc' | 'desc' = 'asc';
 @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal!: ModalDirective;
  constructor(private moduleService: ModuleService) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Modules', active: true },
      { label: 'List View', active: true }
    ];

    this.loadModules();
  }

  // 🔹 Charger tous les modules
  loadModules(): void {
    this.moduleService.getAllModule().subscribe({
      next: (data) => {
        this.moduleList = data;
        this.modules = this.moduleList.slice(0, 10);

      },

      error: (err) => {
        console.error('Erreur lors du chargement des modules', err);

      }
    });
  }

  // 🔎 Recherche
  filterdata() {
    if (this.term) {
      this.modules = this.moduleList.filter(el =>
        el.titre.toLowerCase().includes(this.term.toLowerCase())
      );
    } else {
      this.modules = this.moduleList.slice(0, 10);
    }
    this.updateNoResultDisplay();
  }

  updateNoResultDisplay() {
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

  // 📊 Pagination
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.modules = this.moduleList.slice(startItem, this.endItem);
  }

  // ✅ Sélection multiple
  checkUncheckAll(ev: any) {
    this.modules.forEach((x: any) => (x['state'] = ev.target.checked));
    this.updateCheckedValues();
  }

  onCheckboxChange() {
    this.updateCheckedValues();
  }

  updateCheckedValues() {

    this.checkedValGet.length > 0
      ? document.getElementById('remove-actions')?.classList.remove('d-none')
      : document.getElementById('remove-actions')?.classList.add('d-none');
  }

  // 🗑️ Suppression
  removeItem(id: number) {
    this.deleteID = id;
    // ici tu peux ouvrir un modal de confirmation si tu veux
  }

  deleteData(id?: number) {
    if (id) {
      this.moduleService.deleteModule(id).subscribe(() => {
        this.loadModules(); // refresh après suppression
      });
    }

    if (this.checkedValGet.length > 0) {
      this.checkedValGet.forEach((moduleId) => {
        this.moduleService.deleteModule(moduleId).subscribe();
      });
      this.loadModules();
    }

    this.masterSelected = false;
  }

  // 🔽 Tri
  // onSort(column: keyof Module) {
  //   this.direction = this.direction === 'asc' ? 'desc' : 'asc';
  //   const sortedArray = [...this.modules];
  //   sortedArray.sort((a, b) => {
  //     const res = this.compare(a[column] ?? '', b[column] ?? '');
  //     return this.direction === 'asc' ? res : -res;
  //   });
  //   this.modules = sortedArray;
  // }

  compare(v1: string | number, v2: string | number) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }
    openDeleteModal(): void {
    this.deleteRecordModal.show();
  }

  confirmDelete(): void {
    // ici tu mets ton service de suppression
    console.log('Suppression confirmée');
    this.deleteRecordModal.hide();
  }
}
