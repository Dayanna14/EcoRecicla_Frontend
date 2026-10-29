import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { RolDTOInsert } from '../../../models/RolDTOInsert';
import { Rolservice } from '../../../services/rolservice';
import { forkJoin, of, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-rollistcomponent',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, RouterLink,MatDialogModule],
  templateUrl: './rollistcomponent.html',
  styleUrl: './rollistcomponent.css',
})
export class Rollistcomponent  implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4'];
  dataSource = new MatTableDataSource<RolDTOInsert>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;

  constructor(
    private rS: Rolservice,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.rS.list().pipe(
      // Por cada rol de la lista, pide su detalle (con descripción)
      switchMap(roles =>
        roles.length > 0
          ? forkJoin(roles.map(r => this.rS.listId(r.idRol)))
          : of([])
      )
    ).subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('Error al listar los roles', err);
      }
    });
  }
  // Abre la confirmación escrita en el HTML (CA02)
  eliminar(rol: RolDTOInsert): void {
    this.dialog.open(this.dialogEliminar, {
      data: rol,
      width: '440px',
    }).afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.deleteRol(rol.idRol);
      }
    });
  }

  // Igual que deleteMovie() de la profesora (CA03, CA04, CA05)
  deleteRol(id: number): void {
    this.rS.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Rol eliminado correctamente', 'OK', { duration: 3000 });
        this.listar();
      },
      error: err => {
        const mensaje = err.error?.message ?? 'No se pudo eliminar el rol';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 6000 });
        this.cdr.detectChanges();
      }
    });
  }
}
