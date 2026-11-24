import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-logincomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.css',
})
export class Logincomponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Loginservice);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly ocultarClave = signal(true);
  // Llegó aquí porque su sesión venció (lo manda el interceptor)
  readonly sesionExpirada = this.route.snapshot.queryParamMap.has('expirada');
  errorMessage = '';
  submitting = false;
  // Render duerme el backend gratis: si tarda, avisamos que está despertando
  despertando = false;
  verOlvide = false;
  private aviso: ReturnType<typeof setTimeout> | null = null;

  alternarClave(): void {
    this.ocultarClave.update((valor) => !valor);
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.submitting = true;
    this.despertando = false;
    this.aviso = setTimeout(() => { this.despertando = true; this.cdr.detectChanges(); }, 5000);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.terminarEspera();

        // Entró con una contraseña temporal: primero la cambia
        if (this.auth.debeCambiarContrasenia()) {
          void this.router.navigateByUrl('/cambiar-contrasenia');
          return;
        }

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination =
          returnUrl?.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/'
            ? returnUrl
            : this.inicioSegunRol();

        void this.router.navigateByUrl(destination);
      },
      error: (err: HttpErrorResponse) => {
        this.terminarEspera();
        if (err.status === 0) {
          this.errorMessage = 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
        } else if (err.status === 403) {
          // Cuenta inhabilitada: el backend explica el motivo
          this.errorMessage = err.error?.message ?? 'Tu cuenta está desactivada. Acércate a un centro de acopio.';
        } else if (this.form.controls.username.value.includes('@')) {
          this.errorMessage = 'Usuario o contraseña incorrectos. Recuerda usar tu nombre de usuario, no tu correo.';
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  private terminarEspera(): void {
    this.submitting = false;
    this.despertando = false;
    if (this.aviso) clearTimeout(this.aviso);
    this.cdr.detectChanges();
  }

  // Página de inicio de cada rol después del login
  private inicioSegunRol(): string {
    if (this.auth.hasAnyRole(['ADMINISTRADOR'])) {
      return '/reportes/dashboard';
    }
    if (this.auth.hasAnyRole(['OPERADOR_CENTRO'])) {
      return '/entregas/listar';
    }
    if (this.auth.hasAnyRole(['RECICLADOR'])) {
      return '/reportes/dashboard'; // ahí ve "Mi impacto"
    }
    return '/home';
  }
}
