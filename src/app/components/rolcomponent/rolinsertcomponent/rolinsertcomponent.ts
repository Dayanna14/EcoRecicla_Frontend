import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOInsert } from '../../../models/RolDTOInsert';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rolinsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './rolinsertcomponent.html',
  styleUrl: './rolinsertcomponent.css',
})
export class Rolinsertcomponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private rS: Rolservice,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[A-Z_]+$')]],
      descripcion: ['', Validators.required],
    });
  }

  // Muestra la notificación con el color según el tipo
  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
    });
  }

  // Convierte "supervisor de zona" en "SUPERVISOR_DE_ZONA"
  normalizarNombre(): void {
    const control = this.form.get('nombre');
    const valor = (control?.value ?? '')
      .toUpperCase()
      .replace(/^ROLE_/, '')
      .replace(/\s+/g, '_');
    control?.setValue(valor, { emitEvent: false });
  }

  registrar(formDir: FormGroupDirective): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }

    // Sin idRol: con IDENTITY, enviar id 0 hace fallar a Hibernate
    const rol = {
      nombre: 'ROLE_' + this.form.value.nombre,
      descripcion: this.form.value.descripcion,
    } as RolDTOInsert;

    this.rS.insert(rol).subscribe({
      next: () => {
        this.notificar('Se registró correctamente!!!', 'exito');
        formDir.resetForm();
        this.cdr.detectChanges();
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Ocurrió un error al registrar el rol', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}