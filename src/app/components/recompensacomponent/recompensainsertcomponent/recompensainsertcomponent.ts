import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { RecompensaService } from '../../../services/recompensaservice';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';
import { RecompensaDTOInsert } from '../../../models/RecompensaDTOInsert';
import { TipoRecompensaDTOList } from '../../../models/TipoRecompensaDTOList';

@Component({
  selector: 'app-recompensainsertcomponent',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, RouterLink],
  templateUrl: './recompensainsertcomponent.html',
  styleUrl: './recompensainsertcomponent.css',
})
export class Recompensainsertcomponent implements OnInit {
  form: FormGroup;
  tipos: TipoRecompensaDTOList[] = [];
  estados: any[] = [
    { value: true, viewValue: 'Activa' },
    { value: false, viewValue: 'Inactiva' },
  ];

  constructor(
    private fb: FormBuilder,
    private rS: RecompensaService,
    private tS: Tiporecompensaservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      costoPuntos: [null, [Validators.required, Validators.min(1)]],
      estado: ['', Validators.required],
      imagenUrl: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.listarTipos();
  }

  listarTipos(): void {
    this.tS.list().subscribe({
      next: data => {
        this.tipos = data;
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
    // Sin idRecompensa: con IDENTITY, enviar 0 hace fallar a Hibernate
    const recompensa = {
      nombre: this.form.value.nombre,
      idTipoRecompensa: this.form.value.tipo,
      costoPuntos: this.form.value.costoPuntos,
      estado: this.form.value.estado,
      imagenUrl: this.form.value.imagenUrl,
    } as RecompensaDTOInsert;

    this.rS.insert(recompensa).subscribe({
      next: () => {
        this.notificar('Recompensa registrada correctamente', 'exito');
        formDir.resetForm();
        this.router.navigate(['/recompensas/listar']);
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Ocurrió un error al registrar la recompensa', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}