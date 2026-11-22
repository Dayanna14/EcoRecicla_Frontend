import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CanjePorEstadoDTO } from '../../../models/CanjeporEstadoDTO';
import { Canjeservice } from '../../../services/canjeservice';

type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
@Component({
  selector: 'app-reporte02component',
  imports: [BaseChartDirective],
  templateUrl: './reporte02component.html',
  styleUrl: './reporte02component.css',
})
export class Reporte02component implements OnInit {
lista: CanjePorEstadoDTO[] = [];

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de canjes por estado',
        data: [],
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  constructor(
    private canjeService: Canjeservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerTotal();
  }

  obtenerTotal(): void {
    this.canjeService.obtenerCantidadCanjesPorEstado().subscribe({
      next: (data: CanjePorEstadoDTO[]) => {
        this.lista = data;

        this.chartData = {
          labels: data.map((item) => item.estado),
          datasets: [
            {
              label: 'Cantidad de canjes',
              data: data.map((item) => item.cantidadCanjes),
              backgroundColor: [
                '#2e7d32', // Verde (Entregado)
                '#f9a825', // Amarillo (Pendiente)
                '#c62828', // Rojo (Cancelado)
              ],
              borderWidth: 1,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte por estado:', error);
      },
    });
  }
}
