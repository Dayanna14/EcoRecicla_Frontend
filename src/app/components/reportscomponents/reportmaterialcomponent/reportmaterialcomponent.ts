import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Materialservice } from '../../../services/materialservice';
import { MaterialRankingDTO } from '../../../models/MaterialRankingDTO';

@Component({
  selector: 'app-reportmaterialcomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule, MatDialogModule, RouterLink],
  templateUrl: './reportmaterialcomponent.html',
  styleUrl: './reportmaterialcomponent.css',
})
export class Reportmaterialcomponent implements OnInit {
  lista: MaterialRankingDTO[] = [];
  totalKg: number = 0;
  totalEntregas: number = 0;
  hayError: boolean = false;

  // Lo esencial para la tarjeta: el material más reciclado
  lider: MaterialRankingDTO | null = null;
  porcentajeLider: number = 0;

  // Datos de la ventana de detalle
  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;
  filas: {
    posicion: number; nombre: string; kg: number; porcentaje: number;
    entregas: number; promedio: number; puntosPorKg: number | null; activo: boolean | null;
  }[] = [];
  avisos: string[] = [];
  cargandoDetalle: boolean = false;
  readonly maxFilas: number = 10;

  // Colores de la guía de estilos de EcoRecicla (el primero, ámbar, es para el líder)
  private readonly colores: string[] = ['#c9893e', '#2d5d3e', '#709645', '#88a987', '#5c6b2c', '#b8c7a4', '#95652e'];

  public chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [] }],
  };

  public chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed} kg`,
        },
      },
    },
  };

  constructor(
    private mS: Materialservice,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.mS.ranking().subscribe({
      next: (data: MaterialRankingDTO[]) => {
        this.lista = data;
        this.totalKg = Math.round(data.reduce((suma, m) => suma + Number(m.totalKgReciclados), 0) * 10) / 10;
        this.totalEntregas = data.reduce((suma, m) => suma + Number(m.cantidadEntregas), 0);

        // El backend los envía ordenados de mayor a menor: el primero es el líder
        this.lider = data.length > 0 ? data[0] : null;
        this.porcentajeLider = this.lider && this.totalKg > 0
          ? Math.round((Number(this.lider.totalKgReciclados) / this.totalKg) * 100)
          : 0;

        this.chartData = {
          labels: data.map(m => m.nombreMaterial),
          datasets: [
            {
              data: data.map(m => Number(m.totalKgReciclados)),
              backgroundColor: data.map((m, i) => this.colores[i % this.colores.length]),
              borderColor: '#fdf6e9',
              borderWidth: 2,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte de materiales:', error);
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

  // Cruza el ranking con la lista de materiales para mostrar puntos por kg, estado y avisos
  cargarDetalle(): void {
    this.cargandoDetalle = true;
    this.filas = [];
    this.avisos = [];

    this.mS.list().subscribe({
      next: materiales => {
        this.filas = this.lista.map((item, i) => {
          const material = materiales.find(m => m.nombre === item.nombreMaterial);
          const kg = Number(item.totalKgReciclados);
          const entregas = Number(item.cantidadEntregas);
          return {
            posicion: i + 1,
            nombre: item.nombreMaterial,
            kg: Math.round(kg * 10) / 10,
            porcentaje: this.totalKg > 0 ? Math.round((kg / this.totalKg) * 100) : 0,
            entregas: entregas,
            promedio: entregas > 0 ? Math.round((kg / entregas) * 10) / 10 : 0,
            puntosPorKg: material ? material.puntosPorKg : null,
            activo: material ? material.estado : null,
          };
        });

        // Avisos automáticos: solo aparecen si la regla se cumple con los datos de hoy
        const sinEntregas = materiales
          .filter(m => m.estado && !this.lista.some(item => item.nombreMaterial === m.nombre))
          .map(m => m.nombre);
        if (sinEntregas.length === 1) {
          this.avisos.push(`${sinEntregas[0]} está activo, pero todavía no tiene entregas.`);
        } else if (sinEntregas.length > 1) {
          this.avisos.push(`${sinEntregas.length} materiales activos todavía no tienen entregas: ${sinEntregas.join(', ')}.`);
        }

        this.filas
          .filter(f => f.activo === false)
          .forEach(f => this.avisos.push(`${f.nombre} está inactivo, pero tiene ${f.kg} kg de entregas anteriores.`));

        if (this.lider && this.porcentajeLider > 50 && this.lista.length > 1) {
          this.avisos.push(`${this.lider.nombreMaterial} representa el ${this.porcentajeLider} % de todos los kilos: los demás materiales se reciclan mucho menos.`);
        }

        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el detalle de materiales:', error);
        this.avisos = ['No se pudo cargar el detalle de materiales. Intenta de nuevo.'];
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
    });
  }
}
