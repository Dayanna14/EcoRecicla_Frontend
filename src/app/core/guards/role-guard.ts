import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Loginservice } from '../../services/loginservice';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Loginservice);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const allowedRoles = route.data['roles'];

  if (
    !Array.isArray(allowedRoles) ||
    !allowedRoles.every((role) => typeof role === 'string') ||
    !auth.hasAnyRole(allowedRoles)
  ) {
    // Sin permiso: avisar y volver a su inicio (sin cerrar la sesión)
    inject(MatSnackBar).open('No tienes permiso para ver esa página.', 'Cerrar', {
      duration: 4000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['noti-advertencia'],
    });
    return router.createUrlTree(['/reportes/dashboard']);
  }

  return true;
};