import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CanjeDTOList } from '../../../models/CanjeDTOList';
import { RecompensaDTOList } from '../../../models/RecompensaDTOList';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { Canjeservice } from '../../../services/canjeservice';
import { RecompensaService } from '../../../services/recompensaservice';
import { UsuariosService } from '../../../services/usuariosservice';
import { Entregaservice } from '../../../services/entregaservice';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-canjelistcomponent',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatDialogModule, MatSnackBarModule, RouterLink, DatePipe],
  templateUrl: './canjelistcomponent.html',
  styleUrl: './canjelistcomponent.css',
})
export class Canjelistcomponent implements OnInit {
  dataSource = new MatTableDataSource<CanjeDTOList>();
  // c1 id, c2 fecha, c3 puntos, c4 estado, c5 recompensa, c6 usuario, c7 eliminar, c8 editar
  // c9: acción del día a día (reciclador cancela, operador entrega)
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c9', 'c7', 'c8'];

  listaRecompensas: RecompensaDTOList[] = [];
  listaUsuarios: UsuariosDTOList[] = [];
  // id de usuario -> nombre (para el operador, que no puede listar usuarios)
  nombresPorId = new Map<number, string>();

  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;
  @ViewChild('dialogAccion') dialogAccion!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private canjeService: Canjeservice,
    private recompensaService: RecompensaService,
    private usuarioService: UsuariosService,
    private entregaService: Entregaservice,
    private loginService: Loginservice,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  // Permisos (iguales al backend): registrar ADMIN y RECICLADOR; editar y eliminar solo ADMIN
  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMINISTRADOR']);
  }
  get puedeRegistrar(): boolean {
    return this.loginService.hasAnyRole(['ADMINISTRADOR', 'RECICLADOR']);
  }
  get esOperador(): boolean {
    return this.loginService.hasAnyRole(['OPERADOR_CENTRO']);
  }
  get soloReciclador(): boolean {
    return this.loginService.hasAnyRole(['RECICLADOR']) && !this.loginService.hasAnyRole(['ADMINISTRADOR', 'OPERADOR_CENTRO']);
  }

  ngOnInit(): void {
    this.displayedColumns = this.displayedColumns.filter(c =>
      (c !== 'c7' && c !== 'c8') || this.esAdmin);
    if (this.soloReciclador) {
      this.displayedColumns = this.displayedColumns.filter(c => c !== 'c6'); // ya sabe que son suyos
    }
    this.listar();
    this.recompensaService.list().subscribe({
      next: data => { this.listaRecompensas = data; this.cdr.detectChanges(); },
    });
    if (this.esAdmin) {
      this.usuarioService.list().subscribe({
        next: data => { this.listaUsuarios = data; this.cdr.detectChanges(); },
      });
    } else if (!this.soloReciclador) {
      // Operador: GET /api/usuarios es solo del admin, así que el nombre se saca
      // de las entregas (id del usuario) + el reporte detallado (nombre del usuario)
      forkJoin({
        entregas: this.entregaService.list(),
        detalle: this.entregaService.obtenerReporteDetallado(),
      }).subscribe({
        next: ({ entregas, detalle }) => {
          const nombrePorEntrega = new Map(detalle.map(d => [d.idEntrega, d.nombreUsuario]));
          entregas.forEach(e => {
            const nombre = nombrePorEntrega.get(e.idEntrega);
            if (e.usuarioIdUsuario && nombre) this.nombresPorId.set(e.usuarioIdUsuario, nombre);
          });
          this.cdr.detectChanges();
        },
      });
    }
  }

  listar(): void {
    if (this.soloReciclador) {
      // El backend devuelve solo sus canjes (los identifica con el token)
      this.canjeService.misCanjes().subscribe({
        next: data => this.mostrar(data),
        error: () => this.notificar('No se pudo cargar la lista de canjes', 'error'),
      });
    } else {
      this.canjeService.list().subscribe({
        next: data => this.mostrar(data),
        error: () => this.notificar('No se pudo cargar la lista de canjes', 'error'),
      });
    }
  }

  mostrar(data: CanjeDTOList[]): void {
    this.dataSource.data = [...data].sort((a, b) => b.idCanje - a.idCanje);
    this.dataSource.paginator = this.paginator;
    this.cdr.detectChanges();
  }

  nombreRecompensa(c: CanjeDTOList): string {
    return this.listaRecompensas.find(r => r.idRecompensa === c.recompensaIdRecompensa)?.nombre ?? `Recompensa #${c.recompensaIdRecompensa}`;
  }

  nombreUsuario(c: CanjeDTOList): string {
    return this.listaUsuarios.find(u => u.id_usuario === c.usuarioId_usuario)?.nombre
      ?? this.nombresPorId.get(c.usuarioId_usuario)
      ?? `Usuario #${c.usuarioId_usuario}`;
  }

  // PENDIENTE / COMPLETADO / CANCELADO -> clase del chip
  claseEstado(estado: string): string {
    const e = (estado ?? '').toLowerCase();
    if (e.startsWith('cancel')) return 'chip-cancelado';
    if (e.startsWith('pend')) return 'chip-pendiente';
    return 'chip-completado';
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', { duration: 4000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['noti-' + tipo] });
  }

  eliminar(canje: CanjeDTOList): void {
    this.dialog.open(this.dialogEliminar, { data: canje, width: '440px' })
      .afterClosed()
      .subscribe(confirmado => {
        if (confirmado) {
          this.canjeService.delete(canje.idCanje).subscribe({
            next: () => { this.notificar('Canje eliminado correctamente', 'exito'); this.listar(); },
            error: () => this.notificar('No se pudo eliminar el canje', 'error'),
          });
        }
      });
  }

  esPendiente(c: CanjeDTOList): boolean {
    return (c.estado ?? '').toUpperCase().startsWith('PEND');
  }

  // Reciclador: cancela su canje pendiente y recupera los puntos
  cancelar(canje: CanjeDTOList): void {
    this.confirmar(canje, 'cancelar', () => this.canjeService.cancelar(canje.idCanje).subscribe({
      next: () => { this.notificar(`Canje cancelado. Recuperaste ${canje.puntosUsados} puntos`, 'exito'); this.listar(); },
      error: err => this.notificar(err?.error?.message ?? 'No se pudo cancelar el canje', 'error'),
    }));
  }

  // Operador/admin: entregó la recompensa en el centro
  completar(canje: CanjeDTOList): void {
    this.confirmar(canje, 'entregar', () => this.canjeService.completar(canje.idCanje).subscribe({
      next: () => { this.notificar('Recompensa entregada: el canje quedó completado', 'exito'); this.listar(); },
      error: err => this.notificar(err?.error?.message ?? 'No se pudo completar el canje', 'error'),
    }));
  }

  private confirmar(canje: CanjeDTOList, accion: 'cancelar' | 'entregar', hacer: () => void): void {
    this.dialog.open(this.dialogAccion, { data: { canje, accion, recompensa: this.nombreRecompensa(canje), usuario: this.nombreUsuario(canje) }, width: '440px' })
      .afterClosed()
      .subscribe(ok => { if (ok) hacer(); });
  }
}
