import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EntregaDTOList } from '../../../models/EntregaDTOList';
import { Entregaservice } from '../../../services/entregaservice';
import { UsuariosService } from '../../../services/usuariosservice';
import { Materialservice } from '../../../services/materialservice';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { MaterialDTOList } from '../../../models/MaterialDTOList';
import { CentroAcopioDTOList } from '../../../models/CentroAcopioDTOList';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entregalistcomponent',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './entregalistcomponent.html',
  styleUrl: './entregalistcomponent.css',
})
export class Entregalistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'usuario', 'c2', 'c3', 'c_fecha', 'c4', 'c5', 'c6', 'c7'];
  dataSource = new MatTableDataSource<EntregaDTOList>();

  listaUsuarios: UsuariosDTOList[] = [];
  listaMateriales: MaterialDTOList[] = [];
  listaCentros: CentroAcopioDTOList[] = [];

  idEdicionSeleccionada: number = 0;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private entregaService: Entregaservice,
    private usuarioService: UsuariosService,
    private materialService: Materialservice,
    private centroAcopioService: Centroacopioservice,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listarEntregas();
    this.listarUsuarios();
    this.listarMateriales();
    this.listarCentros();
  }

  listarEntregas(): void {
    this.entregaService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        // Asignación directa tal como lo hacen en el módulo de centros
        this.dataSource.paginator = this.paginator;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al listar las entregas', error);
        this.cdr.markForCheck();
      }
    });
  }

  listarUsuarios(): void {
    this.usuarioService.list().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
        this.cdr.markForCheck();
      }
    });
  }

  listarMateriales(): void {
    this.materialService.list().subscribe({
      next: (data) => {
        this.listaMateriales = data;
        this.cdr.markForCheck();
      }
    });
  }

  listarCentros(): void {
    this.centroAcopioService.list().subscribe({
      next: (data) => {
        this.listaCentros = data;
        this.cdr.markForCheck();
      }
    });
  }

  abrirDialogoEliminar(id: number): void {
    this.idEdicionSeleccionada = id;
    const dialogRef = this.dialog.open(this.dialogEliminar, {
      width: '350px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmarEliminacion();
      }
    });
  }

  confirmarEliminacion(): void {
    this.entregaService.delete(this.idEdicionSeleccionada).subscribe({
      next: () => {
        this.snackBar.open('Entrega eliminada correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.listarEntregas();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al eliminar la entrega', err);
        this.snackBar.open('Error al eliminar la entrega', 'Cerrar', { duration: 3000 });
        this.cdr.markForCheck();
      }
    });
  }
}