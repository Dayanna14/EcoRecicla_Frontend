import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const backendUrl = 'http://localhost:8080/';
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

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};