import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { CourcesComponent } from './cources/cources.component';
import { ProfilComponent } from './profil/profil.component';


const routes: Routes = [
  {
    path: "subscriptions",
    component: SubscriptionsComponent
  },
  {
    path: "cources",
    component: CourcesComponent
  },
   {
    path: "profil",
    component: ProfilComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
