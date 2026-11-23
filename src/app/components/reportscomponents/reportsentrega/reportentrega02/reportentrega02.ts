import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ChartData, ChartOptions } from 'chart.js';
import { Entregaservice } from '../../../../services/entregaservice';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';

const VERDE = '#2d5c3f';
const NARANJA = '#c98a3e';

@Component({
  selector: 'app-reportentrega02',
  imports: [BaseChartDirective, RouterLink, MatIconModule],
  templateUrl: './reportentrega02.html',
  styleUrl: './reportentrega02.css',
})
export class Reportentrega02 implements OnInit {

  total = 0;
  masDe100 = 0;
  resto = 0;
  porcentaje = 0;

  public chartType: 'doughnut' = 'doughnut';

  public chartData: ChartData<'doughnut'> = {
    labels: ['Más de 100 puntos', '100 puntos o menos'],
    datasets: [{
      label: 'Entregas',
      data: [0, 0],
      backgroundColor: [NARANJA, VERDE],
      borderWidth: 0,
      borderRadius: 10,
      spacing: 4,
      hoverOffset: 6
    }]
  };

  public chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    animation: { duration: 800, easing: 'easeOutQuart' },
    layout: { padding: 10 },
    plugins: {
      title: { display: false },
      legend: { display: false },
      tooltip: {
        backgroundColor: VERDE,
        titleColor: '#fff0e5',
        bodyColor: '#fff0e5',
        padding: 12,
        cornerRadius: 10,
        boxPadding: 4,
        titleFont: { family: 'Playfair Display, serif', size: 14 },
        bodyFont: { family: 'Lato, sans-serif', size: 12 },
        callbacks: {
          label: (ctx) => ` ${ctx.parsed} entregas`
        }
      }
    }
  };

  constructor(private eS: Entregaservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    forkJoin({
      total: this.eS.getTotalEntregas(),
      masDe100: this.eS.contarMasDe100Puntos()
    }).subscribe({
      next: ({ total, masDe100 }) => {
        this.total = total;
        this.masDe100 = masDe100;
        this.resto = total - masDe100;
        this.porcentaje = total > 0 ? Math.round((masDe100 / total) * 100) : 0;
        this.chartData = {
          labels: ['Más de 100 puntos', '100 puntos o menos'],
          datasets: [{
            label: 'Entregas',
            data: [masDe100, this.resto],
            backgroundColor: [NARANJA, VERDE],
            borderWidth: 0,
            borderRadius: 10,
            spacing: 4,
            hoverOffset: 6
          }]
        };
        this.cdr.detectChanges();
      }
    });
  }

}