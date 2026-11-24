import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Loginservice } from '../../services/loginservice';
import { Perfilservice } from '../../services/perfilservice';

function coinciden(grupo: AbstractControl): ValidationErrors | null {
  const a = grupo.get('nueva')?.value;
  const b = grupo.get('confirmar')?.value;
  return a && b && a !== b ? { noCoinciden: true } : null;
}

// Se usa en dos casos: entró con contraseña temporal (obligatorio) o la cambia desde "Mi perfil"
@Component({
  selector: 'app-cambiarcontraseniacomponent',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule],
  templateUrl: './cambiarcontraseniacomponent.html',
  styleUrls: ['../logincomponent/logincomponent.css', '../registrocomponent/registrocomponent.css', './cambiarcontraseniacomponent.css'],
})
export class Cambiarcontraseniacomponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Loginservice);
  private readonly perfilS = inject(Perfilservice);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly obligatorio = this.auth.debeCambiarContrasenia();
  readonly ocultarClave = signal(true);

  alternarClave(): void {
    this.ocultarClave.update(valor => !valor);
  }
  errorMessage = '';
  submitting = false;

  readonly form = this.fb.nonNullable.group({
    actual: ['', Validators.required],
    nueva: ['', [Validators.required, Validators.minLength(8)]],
    confirmar: ['', Validators.required],
  }, { validators: coinciden });

  guardar(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.errorMessage = '';
    const v = this.form.getRawValue();
    this.perfilS.cambiarContrasenia({ contraseniaActual: v.actual, contraseniaNueva: v.nueva }).subscribe({
      next: () => {
        this.auth.contraseniaCambiada();
        this.snackBar.open('Tu contraseña se cambió correctamente', 'Cerrar', { duration: 3500, panelClass: ['noti-exito'] });
        void this.router.navigateByUrl(this.obligatorio ? '/reportes/dashboard' : '/perfil');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const msg: string = err.error?.message ?? '';
        if (msg.toLowerCase().includes('actual')) {
          this.form.controls.actual.setErrors({ incorrecta: true });
        } else {
          this.errorMessage = msg || 'No se pudo cambiar la contraseña. Inténtalo nuevamente.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  salir(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
