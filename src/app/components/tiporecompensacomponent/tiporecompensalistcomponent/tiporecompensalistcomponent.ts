import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { TipoRecompensaDTOList } from '../../../models/TipoRecompensaDTOList';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';

@Component({
  selector: 'app-tiporecompensalistcomponent',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterLink,
  ],
  templateUrl: './tiporecompensalistcomponent.html',
  styleUrl: './tiporecompensalistcomponent.css',
})
export class Tiporecompensalistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4'];
  dataSource = new MatTableDataSource<TipoRecompensaDTOList>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;

  constructor(
    private tS: Tiporecompensaservice,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.listar();
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
    this.tS.list().subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('Error al listar los tipos de recompensa', err);
        this.notificar('No se pudo cargar la lista de tipos de recompensa', 'error');
      },
    });
  }

  // Abre la confirmación escrita en el HTML
  eliminar(tipo: TipoRecompensaDTOList): void {
    this.dialog
      .open(this.dialogEliminar, { data: tipo, width: '440px' })
      .afterClosed()
      .subscribe(confirmado => {
        if (confirmado) {
          this.deleteTipo(tipo.idTipoRecompensa);
        }
      });
  }

  deleteTipo(id: number): void {
    this.tS.delete(id).subscribe({
      next: () => {
        this.notificar('Tipo de recompensa eliminado correctamente', 'exito');
        this.listar();
      },
      error: err => {
        // Con responseType 'text' el error puede llegar como texto JSON
        let mensaje = 'No se pudo eliminar el tipo de recompensa';
        try {
          mensaje = JSON.parse(err.error)?.message ?? mensaje;
        } catch {
          mensaje = err.error?.message ?? mensaje;
        }
        this.notificar(mensaje, 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
