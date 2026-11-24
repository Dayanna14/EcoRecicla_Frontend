import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Perfilservice } from '../../services/perfilservice';
import { PerfilDTO } from '../../models/PerfilDTO';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-perfilcomponent',
  imports: [RouterLink, MatButtonModule, MatIconModule, Menucomponent],
  templateUrl: './perfilcomponent.html',
  styleUrl: './perfilcomponent.css',
})
export class Perfilcomponent implements OnInit {
  private readonly perfilS = inject(Perfilservice);
  private readonly cdr = inject(ChangeDetectorRef);

  perfil: PerfilDTO | null = null;
  hayError = false;

  ngOnInit(): void {
    this.perfilS.obtener().subscribe({
      next: data => { this.perfil = data; this.cdr.detectChanges(); },
      error: () => { this.hayError = true; this.cdr.detectChanges(); },
    });
  }

  get inicial(): string {
    return (this.perfil?.nombre ?? '?').charAt(0).toUpperCase();
  }

  get esReciclador(): boolean {
    return this.perfil?.rol === 'ROLE_RECICLADOR';
  }

  nombreRol(rol: string): string {
    return { ROLE_ADMINISTRADOR: 'Administrador', ROLE_OPERADOR_CENTRO: 'Operador de centro', ROLE_RECICLADOR: 'Reciclador' }[rol] ?? rol;
  }
}
