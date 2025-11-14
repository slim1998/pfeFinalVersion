import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Apprenant } from 'src/app/models/apprenant';
import { FormateurService } from 'src/app/services/formateur.service';

@Component({
  selector: 'app-list-apprenent',
  templateUrl: './list-apprenent.component.html',
  styleUrls: ['./list-apprenent.component.scss']
})
export class ListApprenentComponent  implements OnInit {
  @ViewChild('viewDetailsModal', { static: false }) viewDetailsModal?: ModalDirective;

  // Breadcrumb
  breadCrumbItems: Array<{}> = [
    { label: 'Formateurs' },
    { label: 'Liste des Apprenants', active: true }
  ];

  // Liste des apprenants
  apprenantsList: any[] = [];
  filteredApprenantsList: any[] = [];
  selectedApprenant: Apprenant | null = null;
  
  // Search term
  term: string = '';

  // Formateur info
  formateurId: number = 0;
  formateurName: string = '';

  constructor(
    private formateurService: FormateurService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du formateur depuis les paramètres de route
  this.loadApprenants();
   
  }

  /**
   * Charger la liste des apprenants du formateur
   */
  loadApprenants(): void {
    this.formateurId = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : 0;
    this.formateurService.getApprenantsByFormateur(this.formateurId).subscribe({
      next: (data) => {
        this.apprenantsList = data;
        this.filteredApprenantsList = data;
        console.log('Apprenants chargés:', data);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des apprenants:', error);
        // Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  /**
   * Filtrer les données selon le terme de recherche
   */
  filterdata(): void {
    if (!this.term) {
      this.filteredApprenantsList = this.apprenantsList;
      return;
    }

    const searchTerm = this.term.toLowerCase();
    this.filteredApprenantsList = this.apprenantsList.filter(apprenant =>
      apprenant.firstName?.toLowerCase().includes(searchTerm) ||
      apprenant.lastName?.toLowerCase().includes(searchTerm) ||
      apprenant.username?.toLowerCase().includes(searchTerm) ||
      apprenant.email?.toLowerCase().includes(searchTerm) ||
      apprenant.phone?.toLowerCase().includes(searchTerm) ||
      apprenant.niveau?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Voir les détails d'un apprenant
   */
  viewDetails(apprenant: Apprenant): void {
    this.selectedApprenant = apprenant;
    this.viewDetailsModal?.show();
  }

  /**
   * Retourner à la liste des formateurs
   */
  goBack(): void {
    this.router.navigate(['/formateurs']);
  }

  /**
   * Exporter la liste en CSV
   */
  exportToCSV(): void {
    const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Niveau', 'Date de Naissance'];
    const csvData = this.filteredApprenantsList.map(a => [
      a.id,
      a.firstName,
      a.lastName,
      a.email,
      a.phone || 'N/A',
      a.niveau || 'N/A',
      a.dateNaissance || 'N/A'
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apprenants_formateur_${this.formateurId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Imprimer la liste
   */
  printList(): void {
    window.print();
  }
}

