import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOInsert } from '../../../models/RolDTOInsert';
import { RolDTOList } from '../../../models/RolDTOList';
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
  guardando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private rS: Rolservice,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[A-Z_]+$')]],
      descripcion: ['', [Validators.required]],
    });
  }

  // Convierte "supervisor de zona" en "SUPERVISOR_DE_ZONA"
  normalizarNombre(): void {
    const control = this.form.get('nombre');
    const valor = control?.value
      .toUpperCase()
      .replace(/^ROLE_/, '')   // por si el usuario escribe ROLE_ igual
      .replace(/\s+/g, '_');   // espacios por guion bajo
    control?.setValue(valor, { emitEvent: false });
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const rol = {
      nombre: 'ROLE_' + this.form.value.nombre,   // el sistema agrega el prefijo
      descripcion: this.form.value.descripcion,
    } as RolDTOInsert;                            // sin idRol: el backend lo genera

    this.rS.insert(rol).subscribe({
      next: () => {
        this.snackBar.open('Rol registrado correctamente', 'OK', { duration: 3000 });
        this.router.navigate(['/roles/listar']);
      },
      error: err => {
        this.guardando = false;
        const mensaje = err.error?.message ?? 'No se pudo registrar el rol';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        this.cdr.detectChanges();
      }
    });
  }
}
