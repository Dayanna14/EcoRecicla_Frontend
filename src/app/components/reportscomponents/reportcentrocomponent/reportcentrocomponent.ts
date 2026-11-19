import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { CentroAcopioPuntosDTO } from '../../../models/CentroAcopioPuntosDTO';
import { ChartData, ChartOptions } from 'chart.js';
import { Centroacopioservice } from '../../../services/centroacopioservice';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  selector: 'app-reportcentrocomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule],
  templateUrl: './reportcentrocomponent.html',
  styleUrl: './reportcentrocomponent.css',
})
export class Reportcentrocomponent implements OnInit {
  lista: CentroAcopioPuntosDTO[] = [];
  hayError: boolean = false;

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [{ label: 'Puntos generados', data: [], borderWidth: 1 }],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // barras horizontales, como en Figma
    plugins: {
      legend: { display: false },
    },
  };

  constructor(private cS: Centroacopioservice, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.cS.centrosMasPuntos().subscribe({
      next: (data: CentroAcopioPuntosDTO[]) => {
        this.lista = data;
        this.chartData = {
          labels: data.map(item => item.nombreCentro),
          datasets: [
            {
              label: 'Puntos generados',
              data: data.map(item => item.totalPuntos),
              backgroundColor: '#709645', // verde hoja de la paleta
              borderRadius: 6,
              borderWidth: 0,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte de centros:', error);
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }
}