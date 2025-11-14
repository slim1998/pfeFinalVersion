import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardUserComponentComponent } from './dashboard-user/dashboard-user.component';
import { authGuard } from '../guards/auth.guard';
import { formateurGuard } from '../guards/foramteur.guard';
import { adminGuard } from '../guards/admin.guard';
import { apprenantGuard } from '../guards/apprenant.guard';

const routes: Routes = [
  {
    path: 'courses', loadChildren: () => import('./courses/courses.module').then(m => m.CoursesModule)
  },
  {
    path: 'student', loadChildren: () => import('./student/student.module').then(m => m.StudentModule)
  },
  {
    path: 'instructors', loadChildren: () => import('./instructors/instructors.module').then(m => m.InstructorsModule), 
  },
  {
    path: 'quiz', loadChildren: () => import('./quiz/quiz.module').then(m => m.QuizModule),
  },
   {
    path: '',
    component: DashboardUserComponentComponent,
  }
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearningRoutingModule { }
