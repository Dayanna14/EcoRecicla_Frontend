import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MaterialDTOList } from '../../../models/MaterialDTOList';
import { Materialservice } from '../../../services/materialservice';

@Component({
  selector: 'app-materialbuscarcomponent',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './materialbuscarcomponent.html',
  styleUrl: './materialbuscarcomponent.css',
})
export class Materialbuscarcomponent {
  dataSource: MaterialDTOList[] = [];
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5'];
  nombreBuscado: string = '';

  constructor(
    private mS: Materialservice,
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
      this.notificar('Campo obligatorio, ingrese el nombre del material', 'advertencia');
      return;
    }

    this.mS.searchByName(this.nombreBuscado.trim()).subscribe({
      next: data => {
        this.dataSource = data;
        if (data.length === 0) {
          this.notificar('No se encontraron materiales con ese nombre', 'advertencia');
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al buscar materiales', err);
        this.dataSource = [];
        this.notificar('Error al realizar la búsqueda', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
