import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChartData, ChartOptions } from 'chart.js';
import { Entregaservice } from '../../../services/entregaservice';
import { EntregaDetalladaUsuarioyMaterialDTO } from '../../../models/EntregaDetalladaUsuarioyMaterialD';

// Jhon: tarjeta del dashboard con los usuarios que más reciclan (kg), en forma de podio
@Component({
  selector: 'app-reportentregausuariocomponent',
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './reportentregausuariocomponent.html',
  styleUrl: './reportentregausuariocomponent.css',
})
export class Reportentregausuariocomponent implements OnInit {
  ranking: { nombre: string; kg: number }[] = [];
  totalKg: number = 0;
  hayError: boolean = false;
  porcentajeLider: number = 0;
  // Orden del podio: 2º, 1º, 3º
  podio: { nombre: string; kg: number; puesto: number; alto: number }[] = [];

  public chartData: ChartData<'bar'> = { labels: [], datasets: [{ label: 'Kg reciclados', data: [] }] };
  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
  };

  constructor(private eS: Entregaservice, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.eS.obtenerReporteDetallado().subscribe({
      next: (data: EntregaDetalladaUsuarioyMaterialDTO[]) => {
        // Suma los kg de cada usuario
        const suma = new Map<string, number>();
        data.forEach(e => suma.set(e.nombreUsuario, (suma.get(e.nombreUsuario) ?? 0) + Number(e.cantidadKg)));
        this.totalKg = Math.round(data.reduce((s, e) => s + Number(e.cantidadKg), 0) * 10) / 10;

        // Top 5, de mayor a menor
        this.ranking = [...suma.entries()]
          .map(([nombre, kg]) => ({ nombre, kg: Math.round(kg * 10) / 10 }))
          .sort((a, b) => b.kg - a.kg)
          .slice(0, 5);
        this.porcentajeLider = this.ranking.length > 0 && this.totalKg > 0
          ? Math.round((this.ranking[0].kg / this.totalKg) * 100) : 0;

        const maxKg = this.ranking.length > 0 ? this.ranking[0].kg : 1;
        this.podio = [1, 0, 2]
          .filter(i => i < this.ranking.length)
          .map(i => ({ ...this.ranking[i], puesto: i + 1, alto: Math.max(25, Math.round((this.ranking[i].kg / maxKg) * 100)) }));

        this.chartData = {
          labels: this.ranking.map(r => r.nombre),
          datasets: [{
            label: 'Kg reciclados',
            data: this.ranking.map(r => r.kg),
            backgroundColor: this.ranking.map((r, i) => (i === 0 ? '#c9893e' : '#709645')),
            borderRadius: 6,
            borderWidth: 0,
          }],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte de entregas por usuario:', error);
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }
}
