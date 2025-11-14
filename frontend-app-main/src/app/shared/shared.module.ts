import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// component
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { DashboardUserComponentComponent } from '../pages/learning/dashboard-user/dashboard-user.component';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    DashboardUserComponentComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [BreadcrumbsComponent]
})
export class SharedModule { }
