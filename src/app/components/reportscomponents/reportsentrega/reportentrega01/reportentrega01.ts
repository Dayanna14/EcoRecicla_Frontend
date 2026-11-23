import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EntregaDetalladaUsuarioyMaterialDTO } from '../../../../models/EntregaDetalladaUsuarioyMaterialD';
import { ChartData, ChartOptions } from 'chart.js';
import { Entregaservice } from '../../../../services/entregaservice';
import { BaseChartDirective } from 'ng2-charts';

const VERDE = '#2d5c3f';
const NARANJA = '#c98a3e';
const TEXTO = '#5b6b57';
const FUENTE = 'Lato, sans-serif';

@Component({
  selector: 'app-reportentrega01',
  imports: [BaseChartDirective, RouterLink, MatIconModule, DecimalPipe],
  templateUrl: './reportentrega01.html',
  styleUrl: './reportentrega01.css',
})
export class Reportentrega01 implements OnInit {

  lista: EntregaDetalladaUsuarioyMaterialDTO[] = [];
  usuarios: string[] = [];
  materiales: string[] = [];
  usuarioSel = '';
  materialSel = '';
  cargando = true;

  // Resumen de lo que se está mostrando
  agrupadoPor: 'material' | 'usuario' = 'material';
  totalKg = 0;
  totalPuntos = 0;
  totalEntregas = 0;
  liderNombre = '';
  liderKg = 0;
  liderPorcentaje = 0;

  public chartType: 'bar' = 'bar';

  public chartData: ChartData<'bar'> = { labels: [], datasets: [] };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      title: { display: false },
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 10,
          boxHeight: 10,
          padding: 18,
          color: TEXTO,
          font: { family: FUENTE, size: 12 }
        }
      },
      tooltip: {
        backgroundColor: VERDE,
        titleColor: '#fff0e5',
        bodyColor: '#fff0e5',
        padding: 12,
        cornerRadius: 10,
        boxPadding: 4,
        titleFont: { family: 'Playfair Display, serif', size: 14 },
        bodyFont: { family: FUENTE, size: 12 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: 'rgba(45, 92, 63, 0.2)' },
        ticks: { color: TEXTO, font: { family: FUENTE, size: 12 } }
      },
      y: {
        beginAtZero: true,
        position: 'left',
        grid: { color: 'rgba(45, 92, 63, 0.08)' },
        border: { display: false },
        ticks: { color: TEXTO, padding: 8, font: { family: FUENTE, size: 11 } },
        title: { display: true, text: 'Kg', color: VERDE, font: { family: FUENTE, size: 12, weight: 'bold' } }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        border: { display: false },
        ticks: { color: TEXTO, padding: 8, font: { family: FUENTE, size: 11 } },
        title: { display: true, text: 'Puntos', color: NARANJA, font: { family: FUENTE, size: 12, weight: 'bold' } }
      }
    }
  };

  constructor(private eS: Entregaservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Sin parámetros trae todas las entregas; los filtros se arman con esos mismos datos
    this.eS.obtenerReporteDetallado().subscribe({
      next: (data: EntregaDetalladaUsuarioyMaterialDTO[]) => {
        this.lista = data;
        this.usuarios = [...new Set(data.map(e => e.nombreUsuario))].sort();
        this.materiales = [...new Set(data.map(e => e.nombreMaterial))].sort();
        this.cargando = false;
        this.actualizarGrafico();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarUsuario(valor: string): void {
    this.usuarioSel = valor;
    this.actualizarGrafico();
  }

  cambiarMaterial(valor: string): void {
    this.materialSel = valor;
    this.actualizarGrafico();
  }

  limpiar(): void {
    this.usuarioSel = '';
    this.materialSel = '';
    this.actualizarGrafico();
  }

  private actualizarGrafico(): void {
    const filtradas = this.lista.filter(e =>
      (!this.usuarioSel || e.nombreUsuario === this.usuarioSel) &&
      (!this.materialSel || e.nombreMaterial === this.materialSel)
    );

    // Si solo filtras por material se agrupa por usuario; en los demás casos, por material
    const porUsuario = !!this.materialSel && !this.usuarioSel;
    this.agrupadoPor = porUsuario ? 'usuario' : 'material';

    const acumulado = new Map<string, { kg: number; puntos: number }>();
    for (const e of filtradas) {
      const clave = porUsuario ? e.nombreUsuario : e.nombreMaterial;
      const acc = acumulado.get(clave) ?? { kg: 0, puntos: 0 };
      acc.kg += e.cantidadKg;
      acc.puntos += e.puntosGenerados;
      acumulado.set(clave, acc);
    }

    const claves = [...acumulado.keys()];

    // Resumen para las tarjetas y el pie del gráfico
    this.totalEntregas = filtradas.length;
    this.totalKg = Math.round(filtradas.reduce((s, e) => s + e.cantidadKg, 0) * 100) / 100;
    this.totalPuntos = filtradas.reduce((s, e) => s + e.puntosGenerados, 0);

    let lider = '';
    let liderKg = 0;
    for (const c of claves) {
      const kg = acumulado.get(c)!.kg;
      if (kg > liderKg) { lider = c; liderKg = kg; }
    }
    this.liderNombre = lider;
    this.liderKg = Math.round(liderKg * 100) / 100;
    this.liderPorcentaje = this.totalKg > 0 ? Math.round((liderKg / this.totalKg) * 100) : 0;

    this.chartData = {
      labels: claves,
      datasets: [
        {
          label: 'Kg reciclados',
          data: claves.map(c => Math.round(acumulado.get(c)!.kg * 100) / 100),
          yAxisID: 'y',
          backgroundColor: VERDE,
          hoverBackgroundColor: '#3b7552',
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 46
        },
        {
          label: 'Puntos generados',
          data: claves.map(c => acumulado.get(c)!.puntos),
          yAxisID: 'y1',
          backgroundColor: NARANJA,
          hoverBackgroundColor: '#d99a4f',
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 46
        }
      ]
    };
    this.cdr.detectChanges();
  }

}