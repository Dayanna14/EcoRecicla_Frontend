import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuariosservice';
import { Rolservice } from '../../../services/rolservice';
import { UsuariosDTOInsert } from '../../../models/UsuariosDTOInsert';
import { RolDTOList } from '../../../models/RolDTOList';

@Component({
  selector: 'app-usuariosinsertcomponent',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, RouterLink],
  templateUrl: './usuariosinsertcomponent.html',
  styleUrl: './usuariosinsertcomponent.css',
})
export class Usuariosinsertcomponent implements OnInit {
  form: FormGroup;
  roles: RolDTOList[] = [];

  constructor(
    private fb: FormBuilder,
    private uS: UsuariosService,
    private rS: Rolservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasenia: ['', Validators.required],
      rol: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.listarRoles();
  }

  listarRoles(): void {
    this.rS.list().subscribe({
      next: data => {
        this.roles = data;
        this.cdr.detectChanges();
      },
    });
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['noti-' + tipo],
    });
  }

  registrar(formDir: FormGroupDirective): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }
    // Sin id_usuario: con IDENTITY, enviar 0 hace fallar a Hibernate
    const usuario = {
      nombre: this.form.value.nombre,
      email: this.form.value.email,
      contrasenia: this.form.value.contrasenia,
      idRol: this.form.value.rol,
    } as UsuariosDTOInsert;

    this.uS.insert(usuario).subscribe({
      next: () => {
        this.notificar('Usuario registrado correctamente', 'exito');
        formDir.resetForm();
        this.router.navigate(['/usuarios/listar']);
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Ocurrió un error al registrar el usuario', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}