import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Canjeservice } from '../../../services/canjeservice';
import { CanjePorUsuarioDTO } from '../../../models/CanjePorUsuarioDTO';

@Component({
  selector: 'app-reportcanjeusuariocomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './reportcanjeusuariocomponent.html',
  styleUrl: './reportcanjeusuariocomponent.css',
})
export class Reportcanjeusuariocomponent implements OnInit {
  todos: CanjePorUsuarioDTO[] = [];
  lista: CanjePorUsuarioDTO[] = [];
  totalCanjes: number = 0;
  hayError: boolean = false;
  lider: CanjePorUsuarioDTO | null = null;
  porcentajeLider: number = 0;

  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;
  avisos: string[] = [];

  public chartData: ChartData<'bar'> = { labels: [], datasets: [{ label: 'Canjes', data: [] }] };
  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } },
  };

  constructor(private cS: Canjeservice, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.cS.obtenerCantidadCanjesPorUsuario().subscribe({
      next: (data: CanjePorUsuarioDTO[]) => {
        this.todos = [...data].sort((a, b) => b.cantidadCanjes - a.cantidadCanjes);
        this.lista = this.todos.slice(0, 6); // las columnas más altas en la tarjeta
        this.totalCanjes = data.reduce((suma, item) => suma + item.cantidadCanjes, 0);
        this.lider = this.lista.length > 0 ? this.lista[0] : null;
        this.porcentajeLider = this.lider && this.totalCanjes > 0
          ? Math.round((this.lider.cantidadCanjes / this.totalCanjes) * 100) : 0;
        this.chartData = {
          labels: this.lista.map(item => item.nombreUsuario),
          datasets: [{
            label: 'Canjes',
            data: this.lista.map(item => item.cantidadCanjes),
            backgroundColor: this.lista.map((item, i) => (i === 0 ? '#c9893e' : '#709645')),
            borderRadius: 6,
            borderWidth: 0,
            maxBarThickness: 48,
          }],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar canjes por usuario:', error);
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }

  porcentaje(cantidad: number): number {
    return this.totalCanjes > 0 ? Math.round((cantidad / this.totalCanjes) * 100) : 0;
  }

  abrirDetalle(): void {
    if (this.hayError || this.lista.length === 0) {
      return;
    }
    this.avisos = [];
    if (this.lider && this.porcentajeLider > 50 && this.todos.length > 1) {
      this.avisos.push(`${this.lider.nombreUsuario} hace el ${this.porcentajeLider} % de todos los canjes: los demás canjean mucho menos.`);
    }
    this.dialog.open(this.dialogDetalle, { width: '600px', maxWidth: '95vw' });
  }
}
