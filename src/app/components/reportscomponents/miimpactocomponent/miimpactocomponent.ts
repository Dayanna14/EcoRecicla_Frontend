import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DatePipe} from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { Loginservice } from '../../../services/loginservice';
import { Entregaservice } from '../../../services/entregaservice';
import { Canjeservice } from '../../../services/canjeservice';
import { Materialservice } from '../../../services/materialservice';
import { RecompensaService } from '../../../services/recompensaservice';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { EntregaDetalladaUsuarioyMaterialDTO } from '../../../models/EntregaDetalladaUsuarioyMaterialD';

// Dashboard del reciclador: solo sus propios datos
@Component({
  selector: 'app-miimpactocomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule, MatDialogModule, RouterLink, DatePipe],
  templateUrl: './miimpactocomponent.html',
  styleUrl: './miimpactocomponent.css',
})
export class Miimpactocomponent implements OnInit {
  nombre: string = '';
  // Código de reciclador (su id): lo muestra en el centro para que le registren la entrega
  miCodigo: number | null = null;
  cargando: boolean = true;
  hayError: boolean = false;

  // Números
  misEntregas: EntregaDetalladaUsuarioyMaterialDTO[] = [];
  totalKg: number = 0;
  totalPuntos: number = 0;
  puntosCanjeados: number = 0;
  disponibles: number = 0;
  co2: number = 0;

  // Mi puesto
  puesto: number = 0;
  totalRecicladores: number = 0;
  faltaKg: number = 0;

  // Mis materiales
  materiales: { nombre: string; kg: number; porcentaje: number }[] = [];

  // Recompensas a mi alcance
  recompensas: { nombre: string; costo: number; avance: number; falta: number }[] = [];

  // Dónde reciclar
  centros: string[] = [];

  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;

  private readonly colores: string[] = ['#c9893e', '#2d5d3e', '#709645', '#88a987', '#5c6b2c', '#b8c7a4', '#95652e'];

  public lineaData: ChartData<'line'> = { labels: [], datasets: [{ data: [] }] };
  public lineaOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'kg' } }, x: { grid: { display: false } } },
  };

  public donaData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  public donaOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: { legend: { display: false } },
  };

  constructor(
    private loginS: Loginservice,
    private eS: Entregaservice,
    private caS: Canjeservice,
    private mS: Materialservice,
    private rS: RecompensaService,
    private cS: Centroacopioservice,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.nombre = this.loginS.getNombre();
    this.obtenerReporte();
  }

  private mismo(a: string, b: string): boolean {
    return (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();
  }

  obtenerReporte(): void {
    this.cargando = true;
    this.hayError = false;
    forkJoin({
      detalle: this.eS.obtenerReporteDetallado(),
      entregas: this.eS.list(),
      canjes: this.caS.list(),
      materiales: this.mS.list(),
      recompensas: this.rS.list(),
      centros: this.cS.centrosMasPuntos(),
    }).subscribe({
      next: ({ detalle, entregas, canjes, materiales, recompensas, centros }) => {
        // Mis entregas (el reporte viene con el nombre del usuario)
        this.misEntregas = detalle
          .filter(d => this.mismo(d.nombreUsuario, this.nombre))
          .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
        this.totalKg = Math.round(this.misEntregas.reduce((s, d) => s + Number(d.cantidadKg), 0) * 10) / 10;
        this.totalPuntos = this.misEntregas.reduce((s, d) => s + Number(d.puntosGenerados), 0);

        // Mi id: se obtiene cruzando mis entregas con la lista de entregas
        const miId = entregas.find(e => this.misEntregas.some(d => d.idEntrega === e.idEntrega))?.usuarioIdUsuario;
        this.miCodigo = miId ?? null;
        this.puntosCanjeados = miId === undefined ? 0 : canjes
          .filter(c => c.usuarioId_usuario === miId && !(c.estado ?? '').toLowerCase().startsWith('cancel'))
          .reduce((s, c) => s + Number(c.puntosUsados), 0);
        this.disponibles = Math.max(0, this.totalPuntos - this.puntosCanjeados);

        // CO2 evitado: kg x factorCo2 de cada material
        this.co2 = Math.round(this.misEntregas.reduce((s, d) => {
          const mat = materiales.find(m => this.mismo(m.nombre, d.nombreMaterial));
          return s + Number(d.cantidadKg) * (mat ? Number(mat.factorCo2) : 0);
        }, 0) * 10) / 10;

        // Mis materiales
        const porMaterial = new Map<string, number>();
        this.misEntregas.forEach(d => porMaterial.set(d.nombreMaterial, (porMaterial.get(d.nombreMaterial) ?? 0) + Number(d.cantidadKg)));
        this.materiales = [...porMaterial.entries()]
          .map(([nombre, kg]) => ({ nombre, kg: Math.round(kg * 10) / 10, porcentaje: this.totalKg > 0 ? Math.round((kg / this.totalKg) * 100) : 0 }))
          .sort((a, b) => b.kg - a.kg);
        this.donaData = {
          labels: this.materiales.map(m => m.nombre),
          datasets: [{ data: this.materiales.map(m => m.kg), backgroundColor: this.colores, borderWidth: 0 }],
        };

        // Mis kg por mes
        const porMes = new Map<string, number>();
        [...this.misEntregas].reverse().forEach(d => {
          const mes = (d.fecha ?? '').substring(0, 7); // AAAA-MM
          porMes.set(mes, (porMes.get(mes) ?? 0) + Number(d.cantidadKg));
        });
        this.lineaData = {
          labels: [...porMes.keys()],
          datasets: [{
            data: [...porMes.values()].map(kg => Math.round(kg * 10) / 10),
            borderColor: '#2d5d3e',
            backgroundColor: 'rgba(112, 150, 69, 0.25)',
            pointBackgroundColor: '#c9893e',
            fill: true,
            tension: 0.3,
          }],
        };

        // Mi puesto entre todos los recicladores (sin mostrar nombres ajenos)
        const porUsuario = new Map<string, number>();
        detalle.forEach(d => porUsuario.set(d.nombreUsuario, (porUsuario.get(d.nombreUsuario) ?? 0) + Number(d.cantidadKg)));
        const ranking = [...porUsuario.entries()].sort((a, b) => b[1] - a[1]);
        const indice = ranking.findIndex(([n]) => this.mismo(n, this.nombre));
        this.totalRecicladores = ranking.length;
        this.puesto = indice >= 0 ? indice + 1 : 0;
        this.faltaKg = indice > 0 ? Math.round((ranking[indice - 1][1] - ranking[indice][1]) * 10) / 10 : 0;

        // Recompensas activas, de la más barata a la más cara
        this.recompensas = recompensas
          .filter(rec => rec.estado)
          .sort((a, b) => a.costoPuntos - b.costoPuntos)
          .slice(0, 4)
          .map(rec => ({
            nombre: rec.nombre,
            costo: rec.costoPuntos,
            avance: rec.costoPuntos > 0 ? Math.min(100, Math.round((this.disponibles / rec.costoPuntos) * 100)) : 100,
            falta: Math.max(0, rec.costoPuntos - this.disponibles),
          }));

        this.centros = centros.slice(0, 3).map(c => c.nombreCentro);

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar Mi impacto:', error);
        this.cargando = false;
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }

  abrirDetalle(): void {
    if (this.misEntregas.length === 0) {
      return;
    }
    this.dialog.open(this.dialogDetalle, { width: '680px', maxWidth: '95vw' });
  }
}
