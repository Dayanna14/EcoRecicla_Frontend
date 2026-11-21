import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { CentroAcopioPuntosDTO } from '../../../models/CentroAcopioPuntosDTO';
import { ChartData, ChartOptions } from 'chart.js';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Entregaservice } from '../../../services/entregaservice';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  selector: 'app-reportcentrocomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule, MatDialogModule, RouterLink],
  templateUrl: './reportcentrocomponent.html',
  styleUrl: './reportcentrocomponent.css',
})
export class Reportcentrocomponent  implements OnInit {
  lista: CentroAcopioPuntosDTO[] = [];
  totalPuntos: number = 0;
  hayError: boolean = false;

  // Lo esencial para la tarjeta: el centro líder
  lider: CentroAcopioPuntosDTO | null = null;
  porcentajeLider: number = 0;

  // Datos de la ventana de detalle
  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;
  filas: {
    posicion: number; nombre: string; puntos: number; porcentaje: number;
    entregas: number; kg: number; promedio: number; activo: boolean | null;
  }[] = [];
  totalEntregas: number = 0;
  totalKg: number = 0;
  avisos: string[] = [];
  cargandoDetalle: boolean = false;
  readonly maxFilas: number = 10;

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

  constructor(
    private cS: Centroacopioservice,
    private eS: Entregaservice,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.cS.centrosMasPuntos().subscribe({
      next: (data: CentroAcopioPuntosDTO[]) => {
        this.lista = data;
        this.totalPuntos = data.reduce((suma, item) => suma + item.totalPuntos, 0);

        // El backend los envía ordenados de mayor a menor: el primero es el líder
        this.lider = data.length > 0 ? data[0] : null;
        this.porcentajeLider = this.lider && this.totalPuntos > 0
          ? Math.round((this.lider.totalPuntos / this.totalPuntos) * 100)
          : 0;

        this.chartData = {
          labels: data.map(item => item.nombreCentro),
          datasets: [
            {
              label: 'Puntos generados',
              data: data.map(item => item.totalPuntos),
              // El líder en ámbar y los demás en verde hoja
              backgroundColor: data.map((item, i) => (i === 0 ? '#c9893e' : '#709645')),
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

  // Clic en la tarjeta: abre la ventana de detalle
  abrirDetalle(): void {
    if (this.hayError || this.lista.length === 0) {
      return;
    }
    this.cargarDetalle();
    this.dialog.open(this.dialogDetalle, { width: '780px', maxWidth: '95vw' });
  }

  // Cruza el reporte con la lista de centros y de entregas para dar información nueva
  cargarDetalle(): void {
    this.cargandoDetalle = true;
    this.filas = [];
    this.avisos = [];

    forkJoin({
      centros: this.cS.list(),
      entregas: this.eS.list(),
    }).subscribe({
      next: ({ centros, entregas }) => {
        this.filas = this.lista.map((item, i) => {
          const centro = centros.find(c => c.nombre === item.nombreCentro);
          const susEntregas = entregas.filter(e => e.centroAcopioIdCentroAcopio === centro?.idCentro);
          const kg = susEntregas.reduce((suma, e) => suma + Number(e.cantidadKg), 0);
          return {
            posicion: i + 1,
            nombre: item.nombreCentro,
            puntos: item.totalPuntos,
            porcentaje: this.totalPuntos > 0 ? Math.round((item.totalPuntos / this.totalPuntos) * 100) : 0,
            entregas: susEntregas.length,
            kg: Math.round(kg * 10) / 10,
            promedio: susEntregas.length > 0 ? Math.round(item.totalPuntos / susEntregas.length) : 0,
            activo: centro ? centro.estado : null,
          };
        });

        this.totalEntregas = this.filas.reduce((suma, f) => suma + f.entregas, 0);
        this.totalKg = Math.round(this.filas.reduce((suma, f) => suma + f.kg, 0) * 10) / 10;

        // Avisos automáticos: solo aparecen si la regla se cumple con los datos de hoy
        const sinEntregas = centros
          .filter(c => !this.lista.some(item => item.nombreCentro === c.nombre))
          .map(c => c.nombre);
        if (sinEntregas.length === 1) {
          this.avisos.push(`${sinEntregas[0]} todavía no tiene entregas.`);
        } else if (sinEntregas.length > 1) {
          this.avisos.push(`${sinEntregas.length} centros todavía no tienen entregas: ${sinEntregas.join(', ')}.`);
        }

        this.filas
          .filter(f => f.activo === false)
          .forEach(f => this.avisos.push(`${f.nombre} está inactivo, pero tiene ${f.puntos} puntos de entregas anteriores.`));

        if (this.lider && this.porcentajeLider > 50 && this.lista.length > 1) {
          this.avisos.push(`${this.lider.nombreCentro} concentra el ${this.porcentajeLider} % de todos los puntos: los demás centros reciben mucho menos.`);
        }

        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el detalle de centros:', error);
        this.avisos = ['No se pudo cargar el detalle de centros. Intenta de nuevo.'];
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
    });
  }
}