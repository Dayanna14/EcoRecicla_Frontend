import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { Entregaservice } from '../../../services/entregaservice';

// Jhon: tarjeta del dashboard con la proporción de entregas de más de 100 puntos
@Component({
  selector: 'app-reportentregapuntoscomponent',
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './reportentregapuntoscomponent.html',
  styleUrl: './reportentregapuntoscomponent.css',
})
export class Reportentregapuntoscomponent implements OnInit {
  total: number = 0;
  masDe100: number = 0;
  porcentaje: number = 0;
  hayError: boolean = false;

  public chartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  public chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { display: true, position: 'bottom' } },
  };

  constructor(private eS: Entregaservice, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    forkJoin({
      total: this.eS.getTotalEntregas(),
      masDe100: this.eS.contarMasDe100Puntos(),
    }).subscribe({
      next: ({ total, masDe100 }) => {
        this.total = total;
        this.masDe100 = masDe100;
        this.porcentaje = total > 0 ? Math.round((masDe100 / total) * 100) : 0;
        this.chartData = {
          labels: ['Más de 100 puntos', '100 puntos o menos'],
          datasets: [{
            data: [masDe100, total - masDe100],
            backgroundColor: ['#c9893e', '#709645'],
            borderWidth: 0,
          }],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte de entregas destacadas:', error);
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }
}
