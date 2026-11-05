import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { MaterialDTOList } from '../../../models/MaterialDTOList';
import { Materialservice } from '../../../services/materialservice';

@Component({
  selector: 'app-materiallistcomponent',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterLink,
  ],
  templateUrl: './materiallistcomponent.html',
  styleUrl: './materiallistcomponent.css',
})
export class Materiallistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
  dataSource = new MatTableDataSource<MaterialDTOList>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;

  constructor(
    private mS: Materialservice,
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
    this.mS.list().subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('Error al listar los materiales', err);
        this.notificar('No se pudo cargar la lista de materiales', 'error');
      },
    });
  }

  // Abre la confirmación escrita en el HTML
  eliminar(material: MaterialDTOList): void {
    this.dialog
      .open(this.dialogEliminar, { data: material, width: '440px' })
      .afterClosed()
      .subscribe(confirmado => {
        if (confirmado) {
          this.deleteMaterial(material.idMaterial);
        }
      });
  }

  deleteMaterial(id: number): void {
    this.mS.delete(id).subscribe({
      next: () => {
        this.notificar('Material eliminado correctamente', 'exito');
        this.listar();
      },
      error: err => {
        this.notificar(err.error?.message ?? 'No se pudo eliminar el material', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
