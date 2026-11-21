import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { Loginservice } from '../../services/loginservice';
import { UsuariosService } from '../../services/usuariosservice';
import { UsuariosDTOList } from '../../models/UsuariosDTOList';

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



listaUsuarios: UsuariosDTOList[] = [];
  nombreUsuario: string = '';

    constructor(private readonly loginService: Loginservice,
    private readonly router: Router,
    private usuarioService: UsuariosService,
    
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

cargarNombreUsuario(): void {
    this.usuarioService.list().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
        const usuarioActual = this.listaUsuarios.find(
          (u: any) => u.correo === this.username || u.username === this.username || u.email === this.username
        );
        
        if (usuarioActual) {
          this.nombreUsuario = usuarioActual.nombre; // O u.nombreCompleto según tu DTO
        } else {
          this.nombreUsuario = this.username;
        }
      },
      error: (err) => {
        console.error('Error al cargar usuarios para el menú', err);
        this.nombreUsuario = this.username;
      }
    });
  }

  get avatarRol(): string {
    if (this.esAdministrador) {
      return '/img/avatares/avatar-administrador.svg';
    }
    if (this.esOperador) {
      return '/img/avatares/avatar-operador.svg';
    }
    
    return '/img/avatares/avatar-reciclador.svg';
  }
  
}
