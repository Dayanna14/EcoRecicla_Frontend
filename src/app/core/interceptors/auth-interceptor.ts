import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Loginservice } from '../../services/loginservice';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Local: http://localhost:8080 · Desplegado: la URL de Render (sale del environment)
  const backendUrl = environment.base;
  if (!req.url.startsWith(backendUrl)) {
    return next(req);
  }

  if (req.url.endsWith('/login')) {
    return next(req);
  }

  const token = sessionStorage.getItem('token');
  if (!token) {
    return next(req);
  }

  const auth = inject(Loginservice);
  const router = inject(Router);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  ).pipe(
    // ⚠️ NO ENSEÑADO EN CLASE: si el token venció (401), se cierra la sesión y se vuelve al login
    // avisando el motivo, en lugar de dejar la pantalla con errores
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { expirada: 1, returnUrl: router.url } });
      }
      return throwError(() => err);
    })
  );
};