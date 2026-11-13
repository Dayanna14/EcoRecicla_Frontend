import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuariosService } from '../../../services/usuariosservice';
import { Rolservice } from '../../../services/rolservice';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { RolDTOList } from '../../../models/RolDTOList';

@Component({
  selector: 'app-usuarioslistcomponent',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, RouterLink, MatDialogModule],
  templateUrl: './usuarioslistcomponent.html',
  styleUrl: './usuarioslistcomponent.css',
})
export class Usuarioslistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5'];
  dataSource = new MatTableDataSource<UsuariosDTOList>();
  roles: RolDTOList[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dialogEliminar') dialogEliminar!: TemplateRef<any>;

  constructor(
    private uS: UsuariosService,
    private rS: Rolservice,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.listar();
    this.listarRoles();
  }

  listar(): void {
    this.uS.list().subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      error: err => console.log('Error al listar los usuarios', err),
    });
  }

  listarRoles(): void {
    this.rS.list().subscribe({
      next: data => {
        this.roles = data;
        this.cdr.detectChanges();
      },
    });
  }

  nombreRol(idRol: number): string {
    const rol = this.roles.find(r => r.idRol === idRol);
    return rol ? rol.nombre.replace('ROLE_', '') : '';
  }

  eliminar(usuario: UsuariosDTOList): void {
    this.dialog.open(this.dialogEliminar, { data: usuario, width: '440px' })
      .afterClosed().subscribe(confirmado => {
        if (confirmado) {
          this.deleteUsuario(usuario.id_usuario);
        }
      });
  }

  deleteUsuario(id: number): void {
    this.uS.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
          duration: 4000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['noti-exito'],
        });
        this.listar();
      },
      error: err => {
        this.snackBar.open(err.error?.message ?? 'No se pudo eliminar el usuario', 'Cerrar', {
          duration: 6000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['noti-error'],
        });
        this.cdr.detectChanges();
      },
    });
  }
}