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

  // Notificaciones con los estilos globales noti-exito / noti-advertencia / noti-error
  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
    });
  }

  listarEntregas(): void {
    this.entregaService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error al listar las entregas', error);
        this.notificar('No se pudo cargar la lista de entregas', 'error');
      }
    });
  }

  listarUsuarios(): void {
    this.usuarioService.list().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
      }
    });
  }

  listarMateriales(): void {
    this.materialService.list().subscribe({
      next: (data) => {
        this.listaMateriales = data;
      }
    });
  }

  listarCentros(): void {
    this.centroAcopioService.list().subscribe({
      next: (data) => {
        this.listaCentros = data;
      }
    });
  }

  // Abre la confirmación escrita en el HTML; la entrega llega al template como "data"
  eliminar(entrega: EntregaDTOList): void {
    this.dialog
      .open(this.dialogEliminar, { data: entrega, width: '440px' })
      .afterClosed()
      .subscribe(confirmado => {
        if (confirmado) {
          this.confirmarEliminacion(entrega.idEntrega);
        }
      });
  }

  confirmarEliminacion(id: number): void {
    this.entregaService.delete(id).subscribe({
      next: () => {
        this.notificar('Entrega eliminada correctamente', 'exito');
        this.listarEntregas();
      },
      error: (err) => {
        console.error('Error al eliminar la entrega', err);
        this.notificar(err.error?.message ?? 'No se pudo eliminar la entrega', 'error');
      }
    });
  }
}