import { ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { CentroAcopioDTOList } from '../../../models/CentroAcopioDTOList';
import { Centroacopioservice } from '../../../services/centroacopioservice';

@Component({
  selector: 'app-centroacopiobuscarcomponent',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './centroacopiobuscarcomponent.html',
  styleUrl: './centroacopiobuscarcomponent.css',
})
export class Centroacopiobuscarcomponent {
    dataSource: CentroAcopioDTOList[] = [];
  displayedColumns: string[] = ['c1', 'c2', 'c3'];

  estadoSeleccionado: boolean | null = null;

  estados = [
    { value: true, viewValue: 'Activos' },
    { value: false, viewValue: 'Inactivos' },
  ];

  constructor(
    private cS: Centroacopioservice,
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

  buscarPorEstado(): void {
    if (this.estadoSeleccionado === null) {
      this.dataSource = [];
      this.notificar('Campo obligatorio, seleccione un estado', 'advertencia');
      return;
    }

    this.cS.searchByEstado(this.estadoSeleccionado).subscribe({
      next: data => {
        this.dataSource = data;
        if (data.length === 0) {
          this.notificar('No se encontraron centros con ese estado', 'advertencia');
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al buscar centros', err);
        this.dataSource = [];
        this.notificar('Error al realizar la búsqueda', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
