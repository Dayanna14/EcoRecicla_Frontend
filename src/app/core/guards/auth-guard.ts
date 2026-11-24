import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Loginservice } from '../../services/loginservice';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Loginservice);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Entró con una contraseña temporal (la dio el admin): primero debe crear una nueva
  if (auth.debeCambiarContrasenia() && !state.url.startsWith('/cambiar-contrasenia')) {
    return router.createUrlTree(['/cambiar-contrasenia']);
  }

  return true;
};
