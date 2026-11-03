import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RolDTOList } from '../../../models/RolDTOList';
import { Rolservice } from '../../../services/rolservice';

@Component({
  selector: 'app-rolbuscarcomponent',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './rolbuscarcomponent.html',
  styleUrl: './rolbuscarcomponent.css',
})
export class Rolbuscarcomponent {
    dataSource: RolDTOList[] = [];
  displayedColumns: string[] = ['c1', 'c2'];
  nombreBuscado: string = '';

  constructor(
    private rS: Rolservice,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
    });
  }

  buscarPorNombre(): void {
    if (!this.nombreBuscado.trim()) {
      this.dataSource = [];
      this.notificar('Campo obligatorio, ingrese el nombre del rol', 'advertencia');
      return;
    }

    this.rS.searchByName(this.nombreBuscado.trim()).subscribe({
      next: data => {
        this.dataSource = data;
        if (data.length === 0) {
          this.notificar('No se encontraron roles con ese nombre', 'advertencia');
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al buscar roles', err);
        this.dataSource = [];
        this.notificar('Error al realizar la búsqueda', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
