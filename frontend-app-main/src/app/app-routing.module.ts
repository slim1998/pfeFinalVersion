import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import { LayoutComponent } from './layouts/layout.component';
import { AuthlayoutComponent } from './authlayout/authlayout.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './pages/guards/auth.guard';
import { adminGuard } from './pages/guards/admin.guard';
import { MaintenanceComponent } from './extraspages/maintenance/maintenance.component';

const routes: Routes = [
  // Redirect root to home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Home sans sidebar
  { path: 'home', component: HomeComponent },

  // Routes avec sidebar
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/pages.module').then((m) => m.PagesModule),
      },
    ],
  },

  // Auth sans sidebar
  {
    path: 'auth',
    component: AuthlayoutComponent,
    loadChildren: () =>
      import('./account/account.module').then((m) => m.AccountModule),
  },

  {
    path: 'pages',
    component: AuthlayoutComponent,
    loadChildren: () =>
      import('./extraspages/extraspages.module').then(
        (m) => m.ExtraspagesModule
      ),
  },
  {
    path: 'errorPage',
    component: MaintenanceComponent
  },
  // Redirection par défaut
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }