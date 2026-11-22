import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RecompensaService } from '../../../services/recompensaservice';
import { RecompensaBusquedaDTO } from '../../../models/RecompensaBusquedaDTO';

@Component({
  selector: 'app-recompensabuscarcomponent',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './recompensabuscarcomponent.html',
  styleUrl: './recompensabuscarcomponent.css',
})
export class Recompensabuscarcomponent {
  dataSource: RecompensaBusquedaDTO[] = [];
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
  estadoBuscado: boolean | null = null;
  buscado: boolean = false;
  imagenDefecto: string = 'img/modulos/moneda-ecopunto.svg';
  estados: any[] = [
    { value: true, viewValue: 'Activa' },
    { value: false, viewValue: 'Inactiva' },
  ];

  constructor(
    private rS: RecompensaService,
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

  // Si la imagen no carga, se muestra una imagen por defecto
  imagenPorDefecto(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    if (!img.src.includes(this.imagenDefecto)) {
      img.src = this.imagenDefecto;
    }
  }

  buscarPorEstado(): void {
    if (this.estadoBuscado === null) {
      this.dataSource = [];
      this.buscado = false;
      this.notificar('Campo obligatorio, seleccione el estado', 'advertencia');
      return;
    }

    this.rS.buscarPorEstado(this.estadoBuscado).subscribe({
      next: data => {
        this.dataSource = data;
        this.buscado = true;
        if (data.length === 0) {
          this.notificar('No se encontraron recompensas con ese estado', 'advertencia');
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al buscar recompensas', err);
        this.dataSource = [];
        this.notificar('Error al realizar la búsqueda', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}