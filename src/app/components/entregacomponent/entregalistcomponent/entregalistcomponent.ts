import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EntregaDTOList } from '../../../models/EntregaDTOList'; // Ajusta la ruta según tu estructura de carpetas
import { Entregaservice } from '../../../services/entregaservice';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entregalistcomponent',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './entregalistcomponent.html',
  styleUrl: './entregalistcomponent.css',
})
export class Entregalistcomponent implements OnInit {
  // Columnas que mostrará tu tabla (ajustadas a los datos de EntregaDTOList)
  // Define las columnas que renderizará la tabla
displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];

  dataSource: EntregaDTOList[] = [];

  constructor(
    private entregaService: Entregaservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listarEntregas();
  }

  listarEntregas(): void {
    this.entregaService.list().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al listar las entregas', error);
        this.cdr.detectChanges();
      }
    });
  }

  eliminarEntrega(id: number): void {
    this.entregaService.delete(id).subscribe({
      next: () => {
        this.listarEntregas(); // Recarga la tabla tras eliminar
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar la entrega', err);
        this.cdr.detectChanges();
      }
    });
  }
}