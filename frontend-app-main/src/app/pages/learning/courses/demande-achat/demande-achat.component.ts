import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { DemandeAchatService } from 'src/app/services/demande-achat.service';
import { DemandeAchat } from 'src/app/models/demande-achat';

@Component({
  selector: 'app-demande-achat',
  templateUrl: './demande-achat.component.html',
  styleUrl: './demande-achat.component.scss'
})
export class DemandeAchatComponent implements OnInit {
   @ViewChild('viewDetailsModal') viewDetailsModal!: ModalDirective;
 breadCrumbItems!: Array<{}>;

  demandesList: DemandeAchat[] = [];
  originalDemandesList: DemandeAchat[] = [];
  term: string = '';
  deleteID: number | null = null;
selectedDemande?: DemandeAchat;
  @ViewChild('deleteModal') deleteModal: any;

  constructor(
    private demandeService: DemandeAchatService,
    private toastr: ToastrService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.demandeService.getAllDemandeAchat().subscribe({
      next: (data) => {
        this.demandesList = data;
        this.originalDemandesList = [...data];
        console.log('demande', data)
      },
      error: (err) => this.toastr.error('Erreur lors du chargement des demandes')
    });
  }

  filterData(): void {
 
  }


viewDemandeDetails(id: number): void {
  this.demandeService.getDemandeAchatByid(id).subscribe({
    next: (demande) => {
      this.selectedDemande = demande;
      this.viewDetailsModal.show();
    },
    error: () => this.toastr.error('Erreur lors du chargement de la demande')
  });
}
toggleStatut(demande: DemandeAchat, event: any): void {
  if (demande.id != null) {
    // mappe la checkbox sur ACCEPTEE/REFUSEE
    const newStatut: 'ACCEPTEE' | 'REFUSEE' = event.target.checked ? 'ACCEPTEE' : 'REFUSEE';

    this.demandeService.updateDemandeStatut(demande.id, newStatut).subscribe({
      next: () => {
        demande.statut = newStatut;
        this.toastr.success(`Statut modifié en ${newStatut}`, 'Succès');
      },
      error: () => this.toastr.error('Erreur lors de la modification du statut')
    });
  }
}

  removeDemande(id: number): void {
    this.deleteID = id;
    this.deleteModal.show();
  }

  confirmDelete(): void {
    if (this.deleteID != null) {
      this.demandeService.deleteDemandeAchat(this.deleteID).subscribe({
        next: () => {
          this.toastr.success('Demande supprimée', 'Succès');
          this.loadDemandes();
          this.deleteModal.hide();
        },
        error: () => this.toastr.error('Erreur lors de la suppression')
      });
    }
  }
}

