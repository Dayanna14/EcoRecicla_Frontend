import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Materialservice } from '../../../services/materialservice';
import { MaterialDTOInsert } from '../../../models/MaterialDTOInsert';

@Component({
  selector: 'app-materialinsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './materialinsertcomponent.html',
  styleUrl: './materialinsertcomponent.css',
})
export class Materialinsertcomponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private mS: Materialservice,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      puntosPorKg: ['', [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
      factorCo2: ['', [Validators.required, Validators.min(0)]],
      descripcion: [''],
      estado: [true],
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

    // Sin idMaterial: con IDENTITY el id lo genera la base de datos
    const material: MaterialDTOInsert = {
      nombre: this.form.value.nombre.trim(),
      puntosPorKg: Number(this.form.value.puntosPorKg),
      factorCo2: Number(this.form.value.factorCo2),
      descripcion: this.form.value.descripcion,
      estado: this.form.value.estado,
    };

    this.mS.insert(material).subscribe({
      next: () => {
        this.notificar('Se registró correctamente!!!', 'exito');
        formDir.resetForm({ estado: true });
        this.cdr.detectChanges();
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Ocurrió un error al registrar el material', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
