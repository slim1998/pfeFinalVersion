import { Component } from '@angular/core';
// data store
import { Store } from '@ngrx/store';
import { selectCoucesData } from 'src/app/store/students/student.selector';
import { fetchCourcesdata } from 'src/app/store/students/student.action';
import { DemandeAchatService } from 'src/app/services/demande-achat.service';
import { Level, Module } from 'src/app/models/module';
import { ModuleService } from 'src/app/services/module.service';
import { ApprenantService } from 'src/app/services/apprenant.service';
import { Apprenant } from 'src/app/models/apprenant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cources',
  templateUrl: './cources.component.html',
  styleUrls: ['./cources.component.scss']
})
export class CourcesComponent {
  breadCrumbItems!: Array<{}>;
  bsInlineValue = new Date();
  apprenantId! : number; // exemple, tu peux le récupérer dynamiquement
  modules: Module[] = [];
  loading = false;
  isLoading = false;
  error: string | null = null;
  student? : Apprenant

  moduleid? : number 



  constructor(private demandeService: DemandeAchatService,public store: Store,
    private moduleService : ModuleService,
    private apprenantService : ApprenantService,
    private router : Router
  ) { }



  ngOnInit(): void {

    this.apprenantId = Number(localStorage.getItem('userId'))
        this.getstudent();
        this.loadModules();

    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Students', active: true },
      { label: 'My Courses', active: true }
    ];


  }

 goDetails(moduleId: number | undefined) {
  if (!moduleId) return;
  this.router.navigate(['/learning/courses/overview', moduleId]);
}

  getstudent(){
    this.apprenantService.getApprenantByid(this.apprenantId).subscribe({
      next : (data)=>

        this.student = data,
    
    })
  }



  /**
   * Retourne l'affichage textuel du niveau
   */
  getLevelDisplay(level?: Level): string {
    switch (level) {
      case Level.BEGINNER:
        return 'Débutant';
      case Level.INTERMEDIATE:
        return 'Intermédiaire';
      case Level.ADVENCED:
        return 'Avancé';
      case Level.ALL_LEVEL:
        return 'Tous niveaux';
      default:
        return 'Non défini';
    }
  }

  /**
   * Calcule le prix final avec discount
   */
  getFinalPrice(module: Module): number {
    if (module.discount && module.discount > 0) {
      return module.prixInitial * (1 - module.discount / 100);
    }
    return module.prixInitial;
  }




  loadModules(): void {
    this.loading = true;
    this.moduleService.getAcceptedModules(this.apprenantId).subscribe({
      next: (data) => {
        this.modules = data;
        this.loading = false;
        console.log("list formation = " , data)
      },
      error: (err) => {
        console.error('Erreur lors du chargement des modules:', err);
        this.error = 'Impossible de charger les modules.';
        this.loading = false;
      }
    });
  }
}







