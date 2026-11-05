import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TipoRecompensaDTOList } from '../../../models/TipoRecompensaDTOList';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';

@Component({
  selector: 'app-tiporecompensabuscarcomponent',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './tiporecompensabuscarcomponent.html',
  styleUrl: './tiporecompensabuscarcomponent.css',
})
export class Tiporecompensabuscarcomponent {
  dataSource: TipoRecompensaDTOList[] = [];
  displayedColumns: string[] = ['c1', 'c2', 'c3'];
  nombreBuscado: string = '';

  constructor(
    private tS: Tiporecompensaservice,
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
      this.notificar('Campo obligatorio, ingrese el nombre del tipo de recompensa', 'advertencia');
      return;
    }

    this.tS.searchByName(this.nombreBuscado.trim()).subscribe({
      next: data => {
        this.dataSource = data;
        if (data.length === 0) {
          this.notificar('No se encontraron tipos de recompensa con ese nombre', 'advertencia');
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al buscar tipos de recompensa', err);
        this.dataSource = [];
        this.notificar('Error al realizar la búsqueda', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
