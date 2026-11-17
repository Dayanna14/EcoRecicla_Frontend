import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Materialservice } from '../../../services/materialservice';
import { MaterialRankingDTO } from '../../../models/MaterialRankingDTO';

@Component({
  selector: 'app-materialrankingcomponent',
  imports: [NgxChartsModule, MatTableModule, MatIconModule, MatButtonModule, MatProgressBarModule, DecimalPipe],
  templateUrl: './materialrankingcomponent.html',
  styleUrl: './materialrankingcomponent.css',
})
export class Materialrankingcomponent implements OnInit {
  ranking: MaterialRankingDTO[] = [];
  datosGrafico: { name: string; value: number }[] = [];
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4'];

  cargando: boolean = true;
  hayError: boolean = false;

  // Colores de la guía de estilos de EcoRecicla
  esquema: Color = {
    name: 'eco',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2D5D3E', '#709645', '#88A987', '#C9893E', '#5C6B2C', '#B8C7A4', '#95652E'],
  };

  constructor(
    private mS: Materialservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  get totalKg(): number {
    return this.ranking.reduce((suma, r) => suma + r.totalKgReciclados, 0);
  }

  get totalEntregas(): number {
    return this.ranking.reduce((suma, r) => suma + r.cantidadEntregas, 0);
  }

  listar(): void {
    this.cargando = true;
    this.hayError = false;

    this.mS.ranking().subscribe({
      next: data => {
        this.ranking = data;
        // ngx-charts recibe un arreglo de { name, value }
        this.datosGrafico = data.map(r => ({ name: r.nombreMaterial, value: r.totalKgReciclados }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('Error al cargar el ranking de materiales', err);
        this.hayError = true;
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatoKg = (valor: number): string => `${valor} kg`;
}
