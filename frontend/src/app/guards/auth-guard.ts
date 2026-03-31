import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Garante acesso apenas para usuarios autenticados.
export const authGuard: CanActivateFn = async () => {
  const authService = inject(Auth);
  const router = inject(Router);

  try {
    const user = await authService.getCurrentUser();

    if (!user) {
      return router.createUrlTree(['/auth/login']);
    }

    return true;
  } catch (error) {
    console.error('Auth guard error:', error);
    return router.createUrlTree(['/auth/login']);
  }
};
