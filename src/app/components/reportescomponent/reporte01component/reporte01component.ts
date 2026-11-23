import { ChangeDetectorRef, Component } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CanjePorUsuarioDTO } from '../../../models/CanjePorUsuarioDTO';
import { Canjeservice } from '../../../services/canjeservice';


type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  selector: 'app-reporte01component',
  imports: [BaseChartDirective],
  templateUrl: './reporte01component.html',
  styleUrl: './reporte01component.css',
})
export class Reporte01component {
  lista: CanjePorUsuarioDTO[] = [];

  // Puedes cambiar a 'bar' o 'pie' si prefieres otro estilo de gráfico
  public chartType: TipoGrafico = 'doughnut';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de canjes',
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
    private cS: Canjeservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerTotal();
  }

  obtenerTotal(): void {
    this.cS.obtenerCantidadCanjesPorUsuario().subscribe({
      next: (data: CanjePorUsuarioDTO[]) => {
        this.lista = data;

        this.chartData = {
          labels: data.map((item) => item.nombreRecompensa),
          datasets: [
            {
              label: 'Cantidad de canjes por usuario',
              data: data.map((item) => item.cantidadCanjes),
              backgroundColor: [
                '#335ab6',
                '#d9e3f6',
                '#4c6296',
                '#2e7d32',
                '#66bb6a',
              ],
              borderWidth: 1,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte de canjes:', error);
      },
    });
  }
}
