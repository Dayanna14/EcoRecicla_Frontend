import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';
import { TipoRecompensaRankingDTO } from '../../../models/TipoRecompensaRankingDTO';

@Component({
  selector: 'app-tiporecompensarankingcomponent',
  imports: [NgxChartsModule, MatTableModule, MatIconModule, MatButtonModule, MatProgressBarModule, DecimalPipe],
  templateUrl: './tiporecompensarankingcomponent.html',
  styleUrl: './tiporecompensarankingcomponent.css',
})
export class Tiporecompensarankingcomponent implements OnInit {
  ranking: TipoRecompensaRankingDTO[] = [];
  datosGrafico: { name: string; value: number }[] = [];
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4'];

  cargando: boolean = true;
  hayError: boolean = false;

  // Tonos de recompensas de la guía de estilos (ámbar, corcho) y verdes de la marca
  esquema: Color = {
    name: 'eco-recompensas',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#C9893E', '#2D5D3E', '#95652E', '#709645', '#88A987', '#5C6B2C', '#B8C7A4'],
  };

  constructor(
    private tS: Tiporecompensaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  get totalCanjes(): number {
    return this.ranking.reduce((suma, r) => suma + Number(r.cantidadCanjes), 0);
  }

  get totalPuntos(): number {
    return this.ranking.reduce((suma, r) => suma + Number(r.totalPuntosCanjeados), 0);
  }

  listar(): void {
    this.cargando = true;
    this.hayError = false;

    this.tS.ranking().subscribe({
      next: data => {
        this.ranking = data;
        // ngx-charts recibe un arreglo de { name, value }
        this.datosGrafico = data.map(r => ({ name: r.nombreTipoRecompensa, value: Number(r.cantidadCanjes) }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('Error al cargar el ranking de tipos de recompensa', err);
        this.hayError = true;
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
