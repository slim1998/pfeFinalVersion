// CoursesRoutingModule - CORRIGÉ
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component import
import { ListComponent } from './list/list.component';
import { ModuleGridComponent } from './grid/grid.component';
import { CategoryComponent } from './category/category.component';
import { OverviewComponent } from './overview/overview.component';
import { CreateComponent } from './create/create.component';
import { ApprenantListComponent } from './list-apprenant/list-apprenant.component';
import { DemandeAchatComponent } from './demande-achat/demande-achat.component';

const routes: Routes = [
  {
    path: "list",
    component: ListComponent
  },
  {
    path: "grid",
    component: ModuleGridComponent
  },
  {
    path: "category",
    component: CategoryComponent
  },
  {
    path: "overview/:id",  // ← Changé ici : ajout du paramètre :id
    component: OverviewComponent
  },
  {
    path: "create",
    component: CreateComponent
  },
  {
    path: "ListApprenant",
    component: ApprenantListComponent
  },
    {
    path: "demande",
    component: DemandeAchatComponent
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoursesRoutingModule { }