import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizComponent } from './quiz/quiz.component';
import { CertificationComponent } from './certification/certification.component';

const routes: Routes = [
  {path : ''  ,component : QuizComponent},
    {  path: 'certif',
    component: CertificationComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuizRoutingModule { }
