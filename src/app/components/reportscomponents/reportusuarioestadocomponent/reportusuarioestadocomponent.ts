import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { UsuariosService } from '../../../services/usuariosservice';
import { UsuarioPorEstadoDTO } from '../../../models/UsuarioPorEstadoDTO';

@Component({
  selector: 'app-reportusuarioestadocomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './reportusuarioestadocomponent.html',
  styleUrl: './reportusuarioestadocomponent.css',
})
export class Reportusuarioestadocomponent implements OnInit {
  lista: UsuarioPorEstadoDTO[] = [];
  habilitados: number = 0;
  inhabilitados: number = 0;
  total: number = 0;
  porcentaje: number = 0;
  hayError: boolean = false;

  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;
  avisos: string[] = [];

  // ⚠️ NO ENSEÑADO EN CLASE: medidor = dona de media vuelta (circumference 180)
  public chartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  public chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: '72%',
    plugins: { legend: { display: false } },
  };

  constructor(private uS: UsuariosService, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.uS.porEstado().subscribe({
      next: (data: UsuarioPorEstadoDTO[]) => {
        this.lista = data;
        this.habilitados = data.find(d => d.estado.toLowerCase().startsWith('habilit'))?.cantidadUsuarios ?? 0;
        this.inhabilitados = data.find(d => d.estado.toLowerCase().startsWith('inhabilit'))?.cantidadUsuarios ?? 0;
        this.total = this.habilitados + this.inhabilitados;
        this.porcentaje = this.total > 0 ? Math.round((this.habilitados / this.total) * 100) : 0;
        this.chartData = {
          labels: ['Habilitados', 'Inhabilitados'],
          datasets: [{ data: [this.habilitados, this.inhabilitados], backgroundColor: ['#2d5d3e', '#dde5b6'], borderWidth: 0 }],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar usuarios por estado:', error);
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }

  abrirDetalle(): void {
    if (this.hayError || this.total === 0) {
      return;
    }
    this.avisos = [];
    if (this.inhabilitados > 0) {
      this.avisos.push(`${this.inhabilitados} cuenta(s) inhabilitada(s): no pueden iniciar sesión ni registrar entregas o canjes.`);
    }
    if (this.porcentaje < 80) {
      this.avisos.push(`Solo el ${this.porcentaje} % de las cuentas está habilitado. Conviene revisar por qué.`);
    }
    this.dialog.open(this.dialogDetalle, { width: '560px', maxWidth: '95vw' });
  }
}
