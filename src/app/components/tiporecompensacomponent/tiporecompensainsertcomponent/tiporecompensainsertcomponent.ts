import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';
import { TipoRecompensaDTOInsert } from '../../../models/TipoRecompensaDTOInsert';

@Component({
  selector: 'app-tiporecompensainsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './tiporecompensainsertcomponent.html',
  styleUrl: './tiporecompensainsertcomponent.css',
})
export class Tiporecompensainsertcomponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private tS: Tiporecompensaservice,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    // En la base de datos ambos campos tienen máximo 50 caracteres
    this.form = this.fb.group({
      nombreTipoRecompensa: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
    });
  }

  registrar(formDir: FormGroupDirective): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }

    // Sin idTipoRecompensa: con IDENTITY el id lo genera la base de datos
    const tipo: TipoRecompensaDTOInsert = {
      nombreTipoRecompensa: this.form.value.nombreTipoRecompensa.trim(),
      descripcion: this.form.value.descripcion.trim(),
    };

    this.tS.insert(tipo).subscribe({
      next: () => {
        this.notificar('Se registró correctamente!!!', 'exito');
        formDir.resetForm();
        this.cdr.detectChanges();
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Ocurrió un error al registrar el tipo de recompensa', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
