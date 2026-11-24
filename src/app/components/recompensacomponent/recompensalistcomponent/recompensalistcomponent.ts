import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecompensaService } from '../../../services/recompensaservice';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';
import { RecompensaDTOList } from '../../../models/RecompensaDTOList';
import { TipoRecompensaDTOList } from '../../../models/TipoRecompensaDTOList';
import { MatCardModule } from '@angular/material/card';
import { Loginservice } from '../../../services/loginservice';
import { Entregaservice } from '../../../services/entregaservice';
import { Canjeservice } from '../../../services/canjeservice';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-recompensalistcomponent',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, RouterLink, MatDialogModule, MatCardModule],
  templateUrl: './recompensalistcomponent.html',
  styleUrl: './recompensalistcomponent.css',
})
export class Recompensalistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
  dataSource = new MatTableDataSource<RecompensaDTOList>();
  tipos: TipoRecompensaDTOList[] = [];
  vista: 'tabla' | 'tarjetas' = 'tarjetas'; // solo tarjetas
  imagenDefecto: string = 'img/modulos/moneda-ecopunto.svg';
  pagina: RecompensaDTOList[] = []; // recompensas de la página actual (para las tarjetas)
  // Filtro por tipo de recompensa (0 = todas)
  tipoElegido = 0;
  // Reciclador: sus puntos disponibles, para decirle cuánto le falta en cada tarjeta
  misPuntos: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;

  constructor(
    private rS: RecompensaService,
    private tS: Tiporecompensaservice,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private readonly loginService: Loginservice,
    private eS: Entregaservice,
    private cS: Canjeservice,
  ) {}

  ngOnInit(): void {
    // Las tarjetas muestran la misma página que el paginador
    this.dataSource.connect().subscribe(datos => {
      this.pagina = datos;
      this.cdr.detectChanges();
    });
    // El filtro compara el tipo de cada recompensa con el elegido
    this.dataSource.filterPredicate = (r, filtro) => filtro === '0' || String(r.idTipoRecompensa) === filtro;
    this.listar();
    if (this.esReciclador && !this.esAdministrador) {
      forkJoin({ entregas: this.eS.misEntregas(), canjes: this.cS.misCanjes() }).subscribe({
        next: ({ entregas, canjes }) => {
          const ganados = entregas.reduce((t, e) => t + (e.puntosGeneredos ?? 0), 0);
          const gastados = canjes.filter(c => !(c.estado ?? '').toUpperCase().startsWith('CANCEL'))
            .reduce((t, c) => t + (c.puntosUsados ?? 0), 0);
          this.misPuntos = ganados - gastados;
          this.cdr.detectChanges();
        },
      });
    }
    this.listarTipos();
  }

  listar(): void {
    this.rS.list().subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      error: err => console.log('Error al listar las recompensas', err),
    });
  }

  listarTipos(): void {
    this.tS.list().subscribe({
      next: data => {
        this.tipos = data;
        this.cdr.detectChanges();
      },
    });
  }

  // Si la imagen no carga, se muestra una imagen por defecto
  imagenPorDefecto(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    if (!img.src.includes(this.imagenDefecto)) {
      img.src = this.imagenDefecto;
    }
  }

  nombreTipo(idTipo: number): string {
    const tipo = this.tipos.find(t => t.idTipoRecompensa === idTipo);
    return tipo ? tipo.nombreTipoRecompensa : '';
  }

  eliminar(recompensa: RecompensaDTOList): void {
    this.dialog.open(this.dialogEliminar, { data: recompensa, width: '440px' })
      .afterClosed().subscribe(confirmado => {
        if (confirmado) {
          this.deleteRecompensa(recompensa.idRecompensa);
        }
      });
  }

  deleteRecompensa(id: number): void {
    this.rS.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Recompensa eliminada correctamente', 'Cerrar', {
          duration: 4000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['noti-exito'],
        });
        this.listar();
      },
      error: err => {
        this.snackBar.open(err.error?.message ?? 'No se pudo eliminar la recompensa', 'Cerrar', {
          duration: 6000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['noti-error'],
        });
        this.cdr.detectChanges();
      },
    });
  }


  get esAdministrador(): boolean {
    return this.loginService.hasAnyRole(['ADMINISTRADOR']);
  }

  get esReciclador(): boolean {
    return this.loginService.hasAnyRole(['RECICLADOR']);
  }

  filtrarPorTipo(idTipo: number): void {
    this.tipoElegido = idTipo;
    this.dataSource.filter = String(idTipo);
    this.paginator?.firstPage();
  }

  faltan(r: RecompensaDTOList): number {
    return this.misPuntos === null ? 0 : Math.max(0, r.costoPuntos - this.misPuntos);
  }
}
