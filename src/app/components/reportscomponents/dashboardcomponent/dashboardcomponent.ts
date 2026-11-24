import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Reportrolcomponent } from '../reportrolcomponent/reportrolcomponent';
import { Reportcentrocomponent } from '../reportcentrocomponent/reportcentrocomponent';
import { Reportmaterialcomponent } from '../reportmaterialcomponent/reportmaterialcomponent';
import { Reporttiporecompensacomponent } from '../reporttiporecompensacomponent/reporttiporecompensacomponent';
import { Reportrecompensacomponent } from '../reportrecompensacomponent/reportrecompensacomponent';
import { Reportusuarioestadocomponent } from '../reportusuarioestadocomponent/reportusuarioestadocomponent';
import { Reportentregausuariocomponent } from '../reportentregausuariocomponent/reportentregausuariocomponent';
import { Reportentregapuntoscomponent } from '../reportentregapuntoscomponent/reportentregapuntoscomponent';
import { Reportcanjeusuariocomponent } from '../reportcanjeusuariocomponent/reportcanjeusuariocomponent';
import { Reportbalancecomponent } from '../reportbalancecomponent/reportbalancecomponent';
import { Miimpactocomponent } from '../miimpactocomponent/miimpactocomponent';
import { Loginservice } from '../../../services/loginservice';
import { UsuariosService } from '../../../services/usuariosservice';
import { Materialservice } from '../../../services/materialservice';
import { Canjeservice } from '../../../services/canjeservice';
import { Entregaservice } from '../../../services/entregaservice';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-dashboardcomponent',
  imports: [MatIconModule, MatButtonModule, DecimalPipe, DatePipe,
    Reportrolcomponent, Reportcentrocomponent, Reportmaterialcomponent, Reporttiporecompensacomponent,
    Reportrecompensacomponent, Reportusuarioestadocomponent, Reportentregausuariocomponent,
    Reportentregapuntoscomponent, Reportcanjeusuariocomponent, Reportbalancecomponent, Miimpactocomponent],
  templateUrl: './dashboardcomponent.html',
  styleUrl: './dashboardcomponent.css',
})
export class Dashboardcomponent  implements OnInit {
  // Tarjetas de números (null = no se pudo cargar, se muestra "—")
  totalUsuarios: number | null = null;
  totalKg: number | null = null;
  totalCanjes: number | null = null;
  entregas100: number | null = null;
  usuariosActivos: number | null = null;
  usuariosInactivos: number | null = null;

  horaActualizacion: Date = new Date();

  // El padre (dashboard) accede a sus hijos (reportes) para pedirles que se recarguen
  @ViewChild(Reportrolcomponent) reporteRol!: Reportrolcomponent;
  @ViewChild(Reportcentrocomponent) reporteCentro!: Reportcentrocomponent;
  @ViewChild(Reportmaterialcomponent) reporteMaterial!: Reportmaterialcomponent;
  @ViewChild(Reporttiporecompensacomponent) reporteTipoRecompensa!: Reporttiporecompensacomponent;
  @ViewChild(Reportrecompensacomponent) reporteRecompensa!: Reportrecompensacomponent;
  @ViewChild(Reportusuarioestadocomponent) reporteUsuarioEstado!: Reportusuarioestadocomponent;
  @ViewChild(Reportentregausuariocomponent) reporteEntregaUsuario!: Reportentregausuariocomponent;
  @ViewChild(Reportentregapuntoscomponent) reporteEntregaPuntos!: Reportentregapuntoscomponent;
  @ViewChild(Reportcanjeusuariocomponent) reporteCanjeUsuario!: Reportcanjeusuariocomponent;
  @ViewChild(Reportbalancecomponent) reporteBalance!: Reportbalancecomponent;

  constructor(
    private loginS: Loginservice,
    private uS: UsuariosService,
    private mS: Materialservice,
    private caS: Canjeservice,
    private eS: Entregaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  // Qué ve cada rol
  get esAdmin(): boolean {
    return this.loginS.hasAnyRole(['ADMINISTRADOR']);
  }
  get soloReciclador(): boolean {
    return this.loginS.hasAnyRole(['RECICLADOR']) && !this.loginS.hasAnyRole(['ADMINISTRADOR', 'OPERADOR_CENTRO']);
  }

  ngOnInit(): void {
    if (this.soloReciclador) {
      return; // el reciclador ve "Mi impacto", que carga sus propios datos
    }
    this.cargarNumeros();
  }

  cargarNumeros(): void {
    if (this.esAdmin) {
      this.uS.list().subscribe({
        next: data => { this.totalUsuarios = data.length; this.cdr.detectChanges(); },
      });
    }
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
    this.reporteRol?.obtenerReporte();
    this.reporteCentro.obtenerReporte();
    this.reporteMaterial.obtenerReporte();
    this.reporteTipoRecompensa.obtenerReporte();
    this.reporteRecompensa.obtenerReporte();
    this.reporteUsuarioEstado?.obtenerReporte();
    this.reporteEntregaUsuario.obtenerReporte();
    this.reporteEntregaPuntos.obtenerReporte();
    this.reporteCanjeUsuario.obtenerReporte();
    this.reporteBalance?.obtenerReporte();
    this.horaActualizacion = new Date();
    this.cdr.detectChanges();
  }

  // Botón Exportar: abre la ventana de impresión (se puede guardar como PDF)
  exportar(): void {
    window.print();
  }
}