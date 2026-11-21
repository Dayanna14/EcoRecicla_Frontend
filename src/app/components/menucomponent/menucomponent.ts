import { Component } from '@angular/core';
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
export class Menucomponent {
    constructor(private readonly loginService: Loginservice,
    private readonly router: Router
  ) { }
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


  
}
