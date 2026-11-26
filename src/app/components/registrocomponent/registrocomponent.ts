import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Loginservice } from '../../services/loginservice';

// Las dos contraseñas deben coincidir
function coinciden(grupo: AbstractControl): ValidationErrors | null {
  const a = grupo.get('contrasenia')?.value;
  const b = grupo.get('confirmar')?.value;
  return a && b && a !== b ? { noCoinciden: true } : null;
}

@Component({
  selector: 'app-registrocomponent',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatCheckboxModule, MatSnackBarModule],
  templateUrl: './registrocomponent.html',
  // Mismo diseño que el login
  styleUrls: ['../logincomponent/logincomponent.css', './registrocomponent.css'],
})
export class Registrocomponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Loginservice);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(35), Validators.pattern(/^[A-Za-z0-9._-]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/), Validators.maxLength(70)]],
    contrasenia: ['', [Validators.required, Validators.minLength(8)]],
    confirmar: ['', Validators.required],
    acepto: [false, Validators.requiredTrue],
  }, { validators: coinciden });

  readonly ocultarClave = signal(true);

  alternarClave(): void {
    this.ocultarClave.update(valor => !valor);
  }
  errorMessage = '';
  submitting = false;

  registrar(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage = '';
    this.submitting = true;
    const v = this.form.getRawValue();

    this.auth.registrar({ nombre: v.nombre.trim(), email: v.email.trim(), contrasenia: v.contrasenia }).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open(`¡Bienvenido a EcoRecicla, ${v.nombre.trim()}! 🌱`, 'Cerrar', { duration: 4000, panelClass: ['noti-exito'] });
        void this.router.navigateByUrl('/reportes/dashboard');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const msg: string = err.error?.message ?? '';
        // El backend avisa si el usuario o el email ya existen: se muestra en su campo
        if (msg.toLowerCase().includes('usuario')) {
          this.form.controls.nombre.setErrors({ yaExiste: msg });
        } else if (msg.toLowerCase().includes('email')) {
          this.form.controls.email.setErrors({ yaExiste: msg });
        } else {
          this.errorMessage = err.status === 0
            ? 'No hay conexión con el servidor. Inténtalo de nuevo en unos segundos.'
            : (msg || 'No se pudo crear tu cuenta. Inténtalo nuevamente.');
        }
        this.cdr.detectChanges();
      },
    });
  }
}
