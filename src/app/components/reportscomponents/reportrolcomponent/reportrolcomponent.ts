import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { RolMasUtilizadoDTO } from '../../../models/RolMasUtilizadoDTO';
import { ChartData, ChartOptions } from 'chart.js';
import { Rolservice } from '../../../services/rolservice';
import { UsuariosService } from '../../../services/usuariosservice';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';

@Component({
  selector: 'app-reportrolcomponent',
  imports: [BaseChartDirective, MatIconModule, MatButtonModule, MatDialogModule, RouterLink],
  templateUrl: './reportrolcomponent.html',
  styleUrl: './reportrolcomponent.css',
})
export class Reportrolcomponent implements OnInit {
  lista: RolMasUtilizadoDTO[] = [];
  total: number = 0;
  hayError: boolean = false;

  // Lo esencial para la tarjeta
  lider: RolMasUtilizadoDTO | null = null;
  porcentajeLider: number = 0;
  empatados: string[] = []; // roles empatados en el primer lugar

  // Colores de la paleta: el primero (líder) en ámbar para que resalte
  colores: string[] = ['#c9893e', '#2d5d3e', '#5c6b2c', '#88a987', '#b8c7a4'];

  // Datos de la ventana de detalle
  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;
  repartos: { nombre: string; cantidad: number; porcentaje: number; color: string }[] = [];
  grupos: { nombre: string; color: string; cantidad: number; ultimos: string[]; restantes: number }[] = [];
  avisos: string[] = [];
  cargandoDetalle: boolean = false;

  public chartType: TipoGrafico = 'polarArea';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [{ label: 'Usuarios', data: [], borderWidth: 1 }],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // la tarjeta es resumida; el reparto completo va en el detalle
    },
    scales: { r: { ticks: { display: false }, grid: { color: '#f0ead2' } } },
  };

  constructor(
    private rS: Rolservice,
    private uS: UsuariosService,
    private cS: Centroacopioservice,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  // ROLE_OPERADOR_CENTRO -> Operador de centro
  nombreRol(nombre: string): string {
    const texto = nombre.replace('ROLE_', '').replace('_CENTRO', ' de centro').toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  obtenerReporte(): void {
    this.hayError = false;
    this.rS.rolMasUtilizado().subscribe({
      next: (data: RolMasUtilizadoDTO[]) => {
        this.lista = data;
        this.total = data.reduce((suma, item) => suma + item.cantidadUsuarios, 0);

        // El backend los envía ordenados de mayor a menor: el primero es el líder
        this.lider = data.length > 0 ? data[0] : null;
        this.porcentajeLider = this.lider && this.total > 0
          ? Math.round((this.lider.cantidadUsuarios / this.total) * 100)
          : 0;
        // Si otros roles tienen la misma cantidad que el líder, hay empate
        this.empatados = this.lider
          ? data.filter(item => item.cantidadUsuarios === this.lider!.cantidadUsuarios)
                .map(item => this.nombreRol(item.nombreRol))
          : [];

        this.chartData = {
          labels: data.map(item => this.nombreRol(item.nombreRol)),
          datasets: [
            {
              label: 'Usuarios',
              data: data.map(item => item.cantidadUsuarios),
              backgroundColor: this.colores,
              borderWidth: 1,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el reporte de roles:', error);
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
    this.repartos = this.lista.map((item, i) => ({
      nombre: this.nombreRol(item.nombreRol),
      cantidad: item.cantidadUsuarios,
      porcentaje: Math.round((item.cantidadUsuarios / this.total) * 100),
      color: this.colores[i % this.colores.length],
    }));
    this.cargarDetalle();
    this.dialog.open(this.dialogDetalle, { width: '720px', maxWidth: '95vw' });
  }

  // Cruza el reporte con roles, usuarios y centros para dar información nueva
  cargarDetalle(): void {
    this.cargandoDetalle = true;
    this.grupos = [];
    this.avisos = [];

    forkJoin({
      roles: this.rS.list(),
      usuarios: this.uS.list(),
      centros: this.cS.list(),
    }).subscribe({
      next: ({ roles, usuarios, centros }) => {
        // Últimos 3 usuarios registrados de cada rol (id más alto = más reciente)
        this.grupos = this.lista.map((item, i) => {
          const rol = roles.find(r => r.nombre === item.nombreRol);
          const delRol = usuarios
            .filter(u => u.idRol === rol?.idRol)
            .sort((a, b) => b.id_usuario - a.id_usuario);
          const ultimos = delRol.slice(0, 3).map(u => u.nombre);
          return {
            nombre: this.nombreRol(item.nombreRol),
            color: this.colores[i % this.colores.length],
            cantidad: item.cantidadUsuarios,
            ultimos: ultimos,
            restantes: item.cantidadUsuarios - ultimos.length,
          };
        });

        // Avisos automáticos: solo aparecen si la regla se cumple con los datos de hoy
        roles
          .filter(r => !this.lista.some(item => item.nombreRol === r.nombre))
          .forEach(r => this.avisos.push(`El rol ${this.nombreRol(r.nombre)} todavía no tiene usuarios.`));

        const operadores = this.lista.find(item => item.nombreRol === 'ROLE_OPERADOR_CENTRO')?.cantidadUsuarios ?? 0;
        const centrosActivos = centros.filter(c => c.estado).length;
        if (centrosActivos > 0 && operadores < centrosActivos) {
          const textoOperadores = operadores === 1 ? '1 operador' : `${operadores} operadores`;
          this.avisos.push(`Hay ${textoOperadores} para ${centrosActivos} centros activos: algunos centros no tienen un operador propio.`);
        }

        if (this.empatados.length > 1) {
          this.avisos.push(`${this.empatados.join(' y ')} están empatados con ${this.lider?.cantidadUsuarios} usuarios cada uno.`);
        }

        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el detalle de roles:', error);
        this.avisos = ['No se pudo cargar el detalle de usuarios. Intenta de nuevo.'];
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
    });
  }
}