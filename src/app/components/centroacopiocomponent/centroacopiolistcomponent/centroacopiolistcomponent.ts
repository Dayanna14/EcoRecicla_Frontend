import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { CentroAcopioDTOInsert } from '../../../models/CentroAcopioDTOInsert';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { forkJoin, of, switchMap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { UsuariosService } from '../../../services/usuariosservice';

@Component({
  selector: 'app-centroacopiolistcomponent',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatDialogModule,
  ],
  templateUrl: './centroacopiolistcomponent.html',
  styleUrl: './centroacopiolistcomponent.css',
})
export class Centroacopiolistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
  dataSource = new MatTableDataSource<CentroAcopioDTOInsert>();
    usuarios: UsuariosDTOList[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;

  constructor(
    private cS: Centroacopioservice,
    private uS: UsuariosService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.listar();
    this.listarUsuarios();
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
    });
  }

  listar(): void {
    this.cS.list().pipe(
      // Por cada centro, pide su detalle (trae el horario)
      switchMap(centros =>
        centros.length > 0
          ? forkJoin(centros.map(c => this.cS.listId(c.idCentro)))
          : of([])
      )
    ).subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('Error al listar los centros de acopio', err);
      },
    });
  }
    // Trae la lista de la tabla relacionada (FK), igual que listarPeliculas() de la profesora
  listarUsuarios(): void {
    this.uS.list().subscribe({
      next: data => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
    });
  }

  // Abre la confirmación (HUF25 CA02)
  eliminar(centro: CentroAcopioDTOInsert): void {
    this.dialog.open(this.dialogEliminar, {
      data: centro,
      width: '440px',
    }).afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.deleteCentro(centro.idCentro);
      }
    });
  }

  // Igual que deleteMovie() de la profesora
  deleteCentro(id: number): void {
    this.cS.delete(id).subscribe({
      next: () => {
        this.notificar('Centro de acopio eliminado correctamente', 'exito');
        this.listar();
      },
      error: err => {
        this.notificar(err.error?.message ?? 'No se pudo eliminar el centro de acopio', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}