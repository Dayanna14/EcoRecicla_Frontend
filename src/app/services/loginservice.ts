import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequestDTO } from '../models/LoginRequestDTO';
import { LoginResponseDTO } from '../models/LoginResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  private readonly apiURL = `${environment.base}/login`;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private readonly http: HttpClient) { }

  login(credentials: LoginRequestDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiURL, credentials).pipe(
      tap((response) => {
        if (!response?.token) {
          throw new Error('La respuesta de login no contiene un token.');
        }

        if (this.isBrowser) {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('username', response.username ?? '');
          // ⚠️ NO ENSEÑADO EN CLASE: el nombre con el que entró (los reportes vienen por nombre)
          sessionStorage.setItem('nombre', credentials.username ?? '');
          sessionStorage.setItem('roles', JSON.stringify(response.roles ?? []));
        }
      })
    );
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      return null;
    }

    if (this.isExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getUsername(): string {
    if (!this.isBrowser || !this.isAuthenticated()) {
      return '';
    }

    return sessionStorage.getItem('username') ?? '';
  }

  getNombre(): string {
    if (!this.isBrowser || !this.isAuthenticated()) {
      return '';
    }
    return sessionStorage.getItem('nombre') ?? '';
  }

  getRoles(): string[] {
    if (!this.isBrowser || !this.isAuthenticated()) {
      return [];
    }

    const value = sessionStorage.getItem('roles');
    if (!value) {
      return [];
    }

    try {
      const roles: unknown = JSON.parse(value);

      if (Array.isArray(roles) && roles.every((role) => typeof role === 'string')) {
        return roles;
      }
    } catch {
      sessionStorage.removeItem('roles');
      sessionStorage.removeItem('nombre');
      return [];
    }

    sessionStorage.removeItem('roles');
    return [];
  }

  hasAnyRole(allowedRoles: readonly string[]): boolean {
    const normalize = (role: string) =>
      role.startsWith('ROLE_') ? role.slice('ROLE_'.length) : role;

    const allowed = new Set(allowedRoles.map(normalize));
    return this.getRoles().some((role) => allowed.has(normalize(role)));
  }

  logout(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('roles');
      sessionStorage.removeItem('nombre');
    }
  }

  private isExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return true;
      }

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload: unknown = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
      );

      if (payload === null || typeof payload !== 'object' || !('exp' in payload)) {
        return true;
      }

      const exp = payload.exp;
      return typeof exp !== 'number' || !Number.isFinite(exp) || exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}