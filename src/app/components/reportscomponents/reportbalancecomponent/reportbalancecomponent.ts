import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { Entregaservice } from '../../../services/entregaservice';
import { Canjeservice } from '../../../services/canjeservice';
import { UsuariosService } from '../../../services/usuariosservice';

// Balance de puntos: se calcula en el front con la lista de entregas y la de canjes
@Component({
  selector: 'app-reportbalancecomponent',
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './reportbalancecomponent.html',
  styleUrl: './reportbalancecomponent.css',
})
export class Reportbalancecomponent implements OnInit {
  generados: number = 0;
  canjeados: number = 0;
  porCanjear: number = 0;
  porcentajeCanjeado: number = 0;
  hayError: boolean = false;
  cargado: boolean = false;

  @ViewChild('dialogDetalle') dialogDetalle!: TemplateRef<any>;
  filas: { nombre: string; generados: number; canjeados: number; porCanjear: number }[] = [];
  avisos: string[] = [];

  constructor(
    private eS: Entregaservice,
    private cS: Canjeservice,
    private uS: UsuariosService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.hayError = false;
    forkJoin({
      entregas: this.eS.list(),
      canjes: this.cS.list(),
      usuarios: this.uS.list(),
    }).subscribe({
      next: ({ entregas, canjes, usuarios }) => {
        // Los canjes cancelados no gastan puntos
        const canjesValidos = canjes.filter(c => !(c.estado ?? '').toLowerCase().startsWith('cancel'));

        this.generados = entregas.reduce((suma, e) => suma + Number(e.puntosGeneredos), 0);
        this.canjeados = canjesValidos.reduce((suma, c) => suma + Number(c.puntosUsados), 0);
        this.porCanjear = Math.max(0, this.generados - this.canjeados);
        this.porcentajeCanjeado = this.generados > 0 ? Math.min(100, Math.round((this.canjeados / this.generados) * 100)) : 0;

        // Detalle por usuario
        this.filas = usuarios.map(u => {
          const gen = entregas.filter(e => e.usuarioIdUsuario === u.id_usuario).reduce((s, e) => s + Number(e.puntosGeneredos), 0);
          const can = canjesValidos.filter(c => c.usuarioId_usuario === u.id_usuario).reduce((s, c) => s + Number(c.puntosUsados), 0);
          return { nombre: u.nombre, generados: gen, canjeados: can, porCanjear: Math.max(0, gen - can) };
        }).filter(f => f.generados > 0 || f.canjeados > 0)
          .sort((a, b) => b.porCanjear - a.porCanjear);

        this.cargado = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el balance de puntos:', error);
        this.hayError = true;
        this.cdr.detectChanges();
      },
    });
  }

  abrirDetalle(): void {
    if (this.hayError || !this.cargado) {
      return;
    }
    this.avisos = [];
    if (this.generados > 0 && this.porcentajeCanjeado < 50) {
      this.avisos.push(`Solo se ha canjeado el ${this.porcentajeCanjeado} % de los puntos: conviene tener recompensas disponibles para ${this.porCanjear} puntos pendientes.`);
    }
    const mayor = this.filas[0];
    if (mayor && mayor.porCanjear > 0) {
      this.avisos.push(`${mayor.nombre} tiene ${mayor.porCanjear} puntos sin canjear: es quien más puede pedir recompensas.`);
    }
    const sinCanje = this.filas.filter(f => f.generados > 0 && f.canjeados === 0).length;
    if (sinCanje > 0) {
      this.avisos.push(`${sinCanje} usuario(s) reciclan pero nunca han canjeado: podrían no conocer el catálogo de recompensas.`);
    }
    this.dialog.open(this.dialogDetalle, { width: '640px', maxWidth: '95vw' });
  }
}
