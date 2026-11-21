import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuariosservice';
import { Rolservice } from '../../../services/rolservice';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { UsuariosDTOInsert } from '../../../models/UsuariosDTOInsert';
import { RolDTOList } from '../../../models/RolDTOList';

@Component({
  selector: 'app-usuariosupdatecomponent',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, RouterLink],
  templateUrl: './usuariosupdatecomponent.html',
  styleUrl: './usuariosupdatecomponent.css',
})
export class Usuariosupdatecomponent implements OnInit {
  idUsuario: number = 0;
  formUsuario!: FormGroup;
  roles: RolDTOList[] = [];

  constructor(
    private uS: UsuariosService,
    private rS: Rolservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 1. Recuperar el ID desde la URL (/usuarios/editar/:id)
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Crear el formulario (antes del return para que el HTML no falle)
    this.formUsuario = this.fb.group({
      codigo: [this.idUsuario],
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasenia: ['', Validators.required],
      rol: ['', Validators.required],
    });

    if (!this.idUsuario || isNaN(this.idUsuario)) {
      this.notificar('ID de usuario inválido', 'error');
      return;
    }

    // 3. Cargar los roles y los datos actuales
    this.listarRoles();
    this.buscarPorId();
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
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

  buscarPorId(): void {
    this.uS.listId(this.idUsuario).subscribe({
      next: (data: UsuariosDTOList) => {
        this.formUsuario.patchValue({
          codigo: data.id_usuario,
          nombre: data.nombre,
          email: data.email,
          rol: data.idRol,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificar('No se encontró el usuario', 'error');
      },
    });
  }

  actualizarUsuario(): void {
    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }

    const dto: UsuariosDTOInsert = {
      id_usuario: this.formUsuario.value.codigo,
      nombre: this.formUsuario.value.nombre,
      email: this.formUsuario.value.email,
      contrasenia: this.formUsuario.value.contrasenia,
      idRol: this.formUsuario.value.rol,
    };

    this.uS.update(dto).subscribe({
      next: () => {
        this.notificar('Usuario actualizado correctamente', 'exito');
        this.router.navigate(['/usuarios/listar']); // la lista muestra el cambio (CA05)
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Error al actualizar el usuario', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}