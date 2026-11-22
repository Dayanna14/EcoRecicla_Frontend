import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { UsuariosService } from '../../../services/usuariosservice';
import { Rolservice } from '../../../services/rolservice';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { RolDTOList } from '../../../models/RolDTOList';

@Component({
  selector: 'app-usuariosbuscarcomponent',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './usuariosbuscarcomponent.html',
  styleUrl: './usuariosbuscarcomponent.css',
})
export class Usuariosbuscarcomponent implements OnInit {
  dataSource: UsuariosDTOList[] = [];
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4'];
  nombreBuscado: string = '';
  rolBuscado: number = 0; // 0 = todos los roles
  roles: RolDTOList[] = [];
  buscado: boolean = false;

  constructor(
    private uS: UsuariosService,
    private rS: Rolservice,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.rS.list().subscribe({
      next: data => {
        this.roles = data;
        this.cdr.detectChanges();
      },
    });
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
    });
  }

  nombreRol(idRol: number): string {
    const rol = this.roles.find(r => r.idRol === idRol);
    return rol ? rol.nombre.replace('ROLE_', '') : '';
  }

  // El backend no tiene búsqueda de usuarios: se filtra la lista que ya devuelve GET /api/usuarios
  buscar(): void {
    if (!this.nombreBuscado.trim() && this.rolBuscado === 0) {
      this.dataSource = [];
      this.buscado = false;
      this.notificar('Campo obligatorio, ingrese el nombre o seleccione un rol', 'advertencia');
      return;
    }

    this.uS.list().subscribe({
      next: data => {
        const nombre = this.nombreBuscado.trim().toLowerCase();
        this.dataSource = data.filter(
          u => u.nombre.toLowerCase().includes(nombre) &&
               (this.rolBuscado === 0 || u.idRol === this.rolBuscado),
        );
        this.buscado = true;
        if (this.dataSource.length === 0) {
          this.notificar('No se encontraron usuarios con ese criterio', 'advertencia');
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al buscar usuarios', err);
        this.dataSource = [];
        this.notificar('Error al realizar la búsqueda', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}