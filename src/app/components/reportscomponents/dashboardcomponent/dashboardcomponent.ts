import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Reportrolcomponent } from '../reportrolcomponent/reportrolcomponent';
import { Reportcentrocomponent } from '../reportcentrocomponent/reportcentrocomponent';
import { Reportmaterialcomponent } from '../reportmaterialcomponent/reportmaterialcomponent';
import { Reporttiporecompensacomponent } from '../reporttiporecompensacomponent/reporttiporecompensacomponent';
import { UsuariosService } from '../../../services/usuariosservice';
import { Materialservice } from '../../../services/materialservice';
import { Canjeservice } from '../../../services/canjeservice';
import { Entregaservice } from '../../../services/entregaservice';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboardcomponent',
  imports: [MatIconModule, MatButtonModule, DecimalPipe, DatePipe, RouterLink,
    Reportrolcomponent, Reportcentrocomponent, Reportmaterialcomponent, Reporttiporecompensacomponent],
  templateUrl: './dashboardcomponent.html',
  styleUrl: './dashboardcomponent.css',
})
export class Dashboardcomponent  implements OnInit {
  // Tarjetas de números (null = no se pudo cargar, se muestra "—")
  totalUsuarios: number | null = null;
  totalKg: number | null = null;
  totalCanjes: number | null = null;
  entregas100: number | null = null;

  horaActualizacion: Date = new Date();

  // El padre (dashboard) accede a sus hijos (reportes) para pedirles que se recarguen
  @ViewChild(Reportrolcomponent) reporteRol!: Reportrolcomponent;
  @ViewChild(Reportcentrocomponent) reporteCentro!: Reportcentrocomponent;
  @ViewChild(Reportmaterialcomponent) reporteMaterial!: Reportmaterialcomponent;
  @ViewChild(Reporttiporecompensacomponent) reporteTipoRecompensa!: Reporttiporecompensacomponent;

  constructor(
    private uS: UsuariosService,
    private mS: Materialservice,
    private caS: Canjeservice,
    private eS: Entregaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarNumeros();
  }

  cargarNumeros(): void {
    this.uS.list().subscribe({
      next: data => { this.totalUsuarios = data.length; this.cdr.detectChanges(); },
    });
    this.mS.ranking().subscribe({
      next: data => {
        this.totalKg = data.reduce((suma, m) => suma + Number(m.totalKgReciclados), 0);
        this.cdr.detectChanges();
      },
    });
    this.caS.list().subscribe({
      next: data => { this.totalCanjes = data.length; this.cdr.detectChanges(); },
    });
    this.eS.contarMasDe100Puntos().subscribe({
      next: data => { this.entregas100 = data; this.cdr.detectChanges(); },
    });
  }

  // Botón Actualizar: vuelve a pedir los números y cada reporte
  actualizar(): void {
    this.cargarNumeros();
    this.reporteRol.obtenerReporte();
    this.reporteCentro.obtenerReporte();
    this.reporteMaterial.obtenerReporte();
    this.reporteTipoRecompensa.obtenerReporte();
    this.horaActualizacion = new Date();
    this.cdr.detectChanges();
  }

  // Botón Exportar: abre la ventana de impresión (se puede guardar como PDF)
  exportar(): void {
    window.print();
  }
}