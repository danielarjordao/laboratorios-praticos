import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Permite acesso apenas para usuarios nao autenticados.
export const guestGuard: CanActivateFn = async () => {
  const authService = inject(Auth);
  const router = inject(Router);

  try {
    const user = await authService.getCurrentUser();

    if (user) {
      return router.createUrlTree(['/dashboard']);
    }

    return true;
  } catch (error) {
    console.error('Guest guard error:', error);
    return true;
  }
};
