import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequestDTO } from '../models/LoginRequestDTO';
import { LoginResponseDTO } from '../models/LoginResponseDTO';
import { RegistroDTO } from '../models/RegistroDTO';

@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  private readonly apiURL = `${environment.base}/login`;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private readonly http: HttpClient) { }

  login(credentials: LoginRequestDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiURL, credentials).pipe(
      tap((response) => this.guardarSesion(response, credentials.username))
    );
  }

  // Registro público: el backend crea al reciclador y devuelve la sesión ya iniciada
  registrar(datos: RegistroDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(`${environment.base}/registro`, datos).pipe(
      tap((response) => this.guardarSesion(response, datos.nombre))
    );
  }

  private guardarSesion(response: LoginResponseDTO, nombreIngresado: string): void {
    if (!response?.token) {
      throw new Error('La respuesta de login no contiene un token.');
    }

    if (this.isBrowser) {
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('username', response.username ?? '');
      // ⚠️ NO ENSEÑADO EN CLASE: el nombre del usuario (los reportes vienen por nombre)
      sessionStorage.setItem('nombre', response.nombre || nombreIngresado || '');
      sessionStorage.setItem('roles', JSON.stringify(response.roles ?? []));
      sessionStorage.setItem('idUsuario', response.idUsuario != null ? String(response.idUsuario) : '');
      sessionStorage.setItem('debeCambiarContrasenia', response.debeCambiarContrasenia ? 'true' : 'false');
    }
  }

  /** id del usuario que inició sesión (viene del login; null si no hay sesión) */
  getIdUsuario(): number | null {
    if (!this.isBrowser || !this.isAuthenticated()) {
      return null;
    }
    const id = Number(sessionStorage.getItem('idUsuario'));
    return id > 0 ? id : null;
  }

  /** Si entró con una contraseña temporal, debe cambiarla antes de usar la app */
  debeCambiarContrasenia(): boolean {
    return this.isBrowser && sessionStorage.getItem('debeCambiarContrasenia') === 'true';
  }

  contraseniaCambiada(): void {
    if (this.isBrowser) {
      sessionStorage.setItem('debeCambiarContrasenia', 'false');
    }
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
      sessionStorage.removeItem('idUsuario');
      sessionStorage.removeItem('debeCambiarContrasenia');
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