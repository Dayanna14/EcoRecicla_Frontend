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

@Component({
  selector: 'app-recompensalistcomponent',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, RouterLink, MatDialogModule],
  templateUrl: './recompensalistcomponent.html',
  styleUrl: './recompensalistcomponent.css',
})
export class Recompensalistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
  dataSource = new MatTableDataSource<RecompensaDTOList>();
  tipos: TipoRecompensaDTOList[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;

  constructor(
    private rS: RecompensaService,
    private tS: Tiporecompensaservice,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.listar();
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
}