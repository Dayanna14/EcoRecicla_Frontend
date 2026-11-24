import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { RecompensaService } from '../../../services/recompensaservice';
import { RecompensaMasCanjeadaDTO } from '../../../models/RecompensaMasCanjeadaDTO';

@Component({
  selector: 'app-reportrecompensacomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './reportrecompensacomponent.html',
  styleUrl: './reportrecompensacomponent.css',
})
export class Reportrecompensacomponent implements OnInit {
  todas: RecompensaMasCanjeadaDTO[] = [];
  lista: RecompensaMasCanjeadaDTO[] = [];
  totalCanjes: number = 0;
  hayError: boolean = false;
  lider: RecompensaMasCanjeadaDTO | null = null;
  porcentajeLider: number = 0;

  // Datos de la ventana de detalle
  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;
  filas: { posicion: number; nombre: string; canjes: number; porcentaje: number; costo: number | null; puntos: number | null; activo: boolean | null }[] = [];
  totalPuntos: number = 0;
  avisos: string[] = [];
  cargandoDetalle: boolean = false;

  public chartData: ChartData<'bar'> = { labels: [], datasets: [{ label: 'Canjes', data: [] }] };
  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  constructor(private rS: RecompensaService, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.rS.masCanjeadas().subscribe({
      next: (data: RecompensaMasCanjeadaDTO[]) => {
        this.todas = [...data].sort((a, b) => b.totalCanjes - a.totalCanjes);
        this.lista = this.todas.slice(0, 5); // top 5 en la tarjeta
        this.totalCanjes = data.reduce((suma, item) => suma + item.totalCanjes, 0);
        this.lider = this.lista.length > 0 ? this.lista[0] : null;
        this.porcentajeLider = this.lider && this.totalCanjes > 0
          ? Math.round((this.lider.totalCanjes / this.totalCanjes) * 100) : 0;

        this.chartData = {
          labels: this.lista.map(item => item.nombreRecompensa),
          datasets: [{
            label: 'Canjes',
            data: this.lista.map(item => item.totalCanjes),
            backgroundColor: this.lista.map((item, i) => (i === 0 ? '#c9893e' : '#709645')),
            borderRadius: 6,
            borderWidth: 0,
          }],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar recompensas más canjeadas:', error);
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }

  abrirDetalle(): void {
    if (this.hayError || this.lista.length === 0) {
      return;
    }
    this.cargarDetalle();
    this.dialog.open(this.dialogDetalle, { width: '720px', maxWidth: '95vw' });
  }

  // Cruza el reporte con la lista de recompensas: incluye las que nadie canjeó
  cargarDetalle(): void {
    this.cargandoDetalle = true;
    this.avisos = [];
    this.rS.list().subscribe({
      next: recompensas => {
        const nombres = new Set<string>([...this.todas.map(t => t.nombreRecompensa), ...recompensas.map(r => r.nombre)]);
        this.filas = [...nombres].map(nombre => {
          const rep = this.todas.find(t => t.nombreRecompensa === nombre);
          const rec = recompensas.find(r => r.nombre === nombre);
          const canjes = rep ? rep.totalCanjes : 0;
          return {
            posicion: 0, nombre, canjes,
            porcentaje: this.totalCanjes > 0 ? Math.round((canjes / this.totalCanjes) * 100) : 0,
            costo: rec ? rec.costoPuntos : null,
            puntos: rec ? canjes * rec.costoPuntos : null,
            activo: rec ? rec.estado : null,
          };
        }).sort((a, b) => b.canjes - a.canjes).map((f, i) => ({ ...f, posicion: i + 1 }));
        this.totalPuntos = this.filas.reduce((suma, f) => suma + (f.puntos ?? 0), 0);

        const sinCanjes = this.filas.filter(f => f.canjes === 0).map(f => f.nombre);
        if (sinCanjes.length > 0) {
          this.avisos.push(`Nadie ha canjeado todavía: ${sinCanjes.join(', ')}. Conviene revisar su costo o difundirlas.`);
        }
        this.filas.filter(f => f.activo === false && f.canjes > 0)
          .forEach(f => this.avisos.push(`${f.nombre} está inactiva, pero tiene ${f.canjes} canjes anteriores.`));
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.avisos = ['No se pudo cargar el detalle de recompensas. Intenta de nuevo.'];
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
    });
  }
}
