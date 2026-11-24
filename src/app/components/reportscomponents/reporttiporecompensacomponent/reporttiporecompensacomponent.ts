import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';
import { TipoRecompensaRankingDTO } from '../../../models/TipoRecompensaRankingDTO';

@Component({
  selector: 'app-reporttiporecompensacomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule, MatDialogModule, RouterLink, DecimalPipe],
  templateUrl: './reporttiporecompensacomponent.html',
  styleUrl: './reporttiporecompensacomponent.css',
})
export class Reporttiporecompensacomponent implements OnInit {
  lista: TipoRecompensaRankingDTO[] = [];
  totalCanjes: number = 0;
  totalPuntos: number = 0;
  hayError: boolean = false;

  // Lo esencial para la tarjeta: el tipo de recompensa más canjeado
  lider: TipoRecompensaRankingDTO | null = null;
  porcentajeLider: number = 0;

  // Datos de la ventana de detalle
  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;
  filas: {
    posicion: number; nombre: string; canjes: number; porcentaje: number;
    puntos: number; promedio: number;
  }[] = [];
  avisos: string[] = [];
  cargandoDetalle: boolean = false;
  readonly maxFilas: number = 10;

  public chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ label: 'Canjes', data: [] }],
  };

  public chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom', labels: { boxWidth: 10 } },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed} canjes`,
        },
      },
    },
  };

  constructor(
    private tS: Tiporecompensaservice,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.tS.ranking().subscribe({
      next: (data: TipoRecompensaRankingDTO[]) => {
        this.lista = data;
        this.totalCanjes = data.reduce((suma, t) => suma + Number(t.cantidadCanjes), 0);
        this.totalPuntos = data.reduce((suma, t) => suma + Number(t.totalPuntosCanjeados), 0);

        // El backend los envía ordenados de mayor a menor: el primero es el líder
        this.lider = data.length > 0 ? data[0] : null;
        this.porcentajeLider = this.lider && this.totalCanjes > 0
          ? Math.round((Number(this.lider.cantidadCanjes) / this.totalCanjes) * 100)
          : 0;

        this.chartData = {
          labels: data.map(t => t.nombreTipoRecompensa),
          datasets: [
            {
              label: 'Canjes',
              data: data.map(t => Number(t.cantidadCanjes)),
              // El líder en ámbar y los demás en verdes de la paleta
              backgroundColor: ['#c9893e', '#2d5d3e', '#709645', '#88a987', '#5c6b2c', '#b8c7a4', '#95652e'],
              borderColor: '#fff1e6',
              borderWidth: 2,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte de tipos de recompensa:', error);
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }

  // Clic en la tarjeta: abre la ventana de detalle
  abrirDetalle(): void {
    if (this.hayError || this.lista.length === 0) {
      return;
    }
    this.cargarDetalle();
    this.dialog.open(this.dialogDetalle, { width: '720px', maxWidth: '95vw' });
  }

  // Cruza el ranking con la lista de tipos para detectar los que nunca se canjearon
  cargarDetalle(): void {
    this.cargandoDetalle = true;
    this.avisos = [];

    this.filas = this.lista.map((item, i) => {
      const canjes = Number(item.cantidadCanjes);
      const puntos = Number(item.totalPuntosCanjeados);
      return {
        posicion: i + 1,
        nombre: item.nombreTipoRecompensa,
        canjes: canjes,
        porcentaje: this.totalCanjes > 0 ? Math.round((canjes / this.totalCanjes) * 100) : 0,
        puntos: puntos,
        promedio: canjes > 0 ? Math.round(puntos / canjes) : 0,
      };
    });

    this.tS.list().subscribe({
      next: tipos => {
        // Avisos automáticos: solo aparecen si la regla se cumple con los datos de hoy
        const sinCanjes = tipos
          .filter(t => !this.lista.some(item => item.nombreTipoRecompensa === t.nombreTipoRecompensa))
          .map(t => t.nombreTipoRecompensa);
        if (sinCanjes.length === 1) {
          this.avisos.push(`${sinCanjes[0]} todavía no tiene canjes.`);
        } else if (sinCanjes.length > 1) {
          this.avisos.push(`${sinCanjes.length} tipos de recompensa todavía no tienen canjes: ${sinCanjes.join(', ')}.`);
        }

        if (this.lider && this.porcentajeLider > 50 && this.lista.length > 1) {
          this.avisos.push(`${this.lider.nombreTipoRecompensa} concentra el ${this.porcentajeLider} % de todos los canjes: los demás tipos se canjean mucho menos.`);
        }

        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el detalle de tipos de recompensa:', error);
        this.avisos = ['No se pudo revisar qué tipos de recompensa no tienen canjes. Intenta de nuevo.'];
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
    });
  }
}
