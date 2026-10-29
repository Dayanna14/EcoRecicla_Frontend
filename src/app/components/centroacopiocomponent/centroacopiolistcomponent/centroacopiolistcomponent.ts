import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { CentroAcopioDTOInsert } from '../../../models/CentroAcopioDTOInsert';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { forkJoin, of, switchMap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-centroacopiolistcomponent',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatDialogModule,
  ],
  templateUrl: './centroacopiolistcomponent.html',
  styleUrl: './centroacopiolistcomponent.css',
})
export class Centroacopiolistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5'];
  dataSource = new MatTableDataSource<CentroAcopioDTOInsert>();

  // Opciones del filtro (como el ejemplo de mat-select)
  estados: any[] = [
    { value: 'todos', viewValue: 'Todos los estados' },
    { value: 'activos', viewValue: 'Activos' },
    { value: 'inactivos', viewValue: 'Inactivos' },
  ];
  estadoFiltro: string = 'todos';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;


  constructor(
    private cS: Centroacopioservice,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,     
    private snackBar: MatSnackBar, 
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    // Todos → GET /api/centrosacopio ; Activos/Inactivos → GET /buscar?estado=
    const peticion =
      this.estadoFiltro === 'todos'
        ? this.cS.list()
        : this.cS.searchByEstado(this.estadoFiltro === 'activos');

    peticion.pipe(
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
      }
    });
  }

    // NUEVO: abre la confirmación (CA02)
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

  // NUEVO: igual que deleteMovie() de la profesora (CA03, CA04, CA05)
  deleteCentro(id: number): void {
    this.cS.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Centro de acopio eliminado correctamente', 'OK', { duration: 3000 });
        this.listar();
      },
      error: err => {
        const mensaje = err.error?.message ?? 'No se pudo eliminar el centro de acopio';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 6000 });
        this.cdr.detectChanges();
      }
    });
  }
}