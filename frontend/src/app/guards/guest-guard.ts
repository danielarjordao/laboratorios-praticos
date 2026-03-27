import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const guestGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const user = await authService.getCurrentUser();

  if (user) {
    // Já está logado, redireciona para o dashboard
    router.navigate(['/dashboard']);
    return false;
  } else {
    return true;
  }
};
