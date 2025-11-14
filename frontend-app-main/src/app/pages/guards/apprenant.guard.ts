import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ApprenantService } from 'src/app/services/apprenant.service';


export const apprenantGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApprenantService);
  const router = inject(Router);


  if (authService.isUserAuthenticatedtest() && authService.getRole() === 'APPRENANT') {
    return true;
  }


  router.navigate(['/errorPage']);
  return false;
};