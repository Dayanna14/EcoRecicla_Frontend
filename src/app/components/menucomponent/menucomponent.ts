import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-menucomponent',
  imports: [MatToolbarModule, 
    MatIconModule, 
    MatMenuModule, 
    MatButtonModule, 
    RouterLink],
  templateUrl: './menucomponent.html',
  styleUrl: './menucomponent.css',
})

export class Menucomponent implements OnInit{



  nombreUsuario: string = '';

    constructor(private readonly loginService: Loginservice,
    private readonly router: Router,
    
  ) { }


ngOnInit(): void {
    if (this.username) {
      this.cargarNombreUsuario();
    }
  }

  get username(): string {
    return this.loginService.getUsername();
  }

  get roles(): string {
    return this.loginService.getRoles().join(', ');
  }
  cerrarSesion(): void {
    this.loginService.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
  get esReciclador(): boolean {
    return this.loginService.hasAnyRole(['RECICLADOR']);
  }
   get esAdministrador(): boolean {
    return this.loginService.hasAnyRole(['ADMINISTRADOR']);
  }

  get esOperador(): boolean {
    return this.loginService.hasAnyRole(['OPERADOR_CENTRO']);
  }

/** El nombre con el que inició sesión: está guardado desde el login, así que sale al instante
   *  (antes se pedía la lista de usuarios, que solo el admin puede ver y tardaba) */
  cargarNombreUsuario(): void {
    this.nombreUsuario = this.loginService.getNombre() || this.username.split('@')[0];
  }

  get inicial(): string {
    return (this.nombreUsuario || this.username || '?').trim().charAt(0).toUpperCase();
  }

  get nombreRol(): string {
    if (this.esAdministrador) return 'Administrador';
    if (this.esOperador) return 'Operador de centro';
    return 'Reciclador';
  }

  /** Color del círculo según el rol */
  get claseRol(): string {
    if (this.esAdministrador) return 'rol-admin';
    if (this.esOperador) return 'rol-operador';
    return 'rol-reciclador';
  }
}
