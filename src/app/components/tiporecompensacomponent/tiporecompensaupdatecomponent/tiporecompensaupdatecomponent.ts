import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';
import { TipoRecompensaDTOInsert } from '../../../models/TipoRecompensaDTOInsert';
import { TipoRecompensaDTOList } from '../../../models/TipoRecompensaDTOList';

@Component({
  selector: 'app-tiporecompensaupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './tiporecompensaupdatecomponent.html',
  styleUrl: './tiporecompensaupdatecomponent.css',
})
export class Tiporecompensaupdatecomponent implements OnInit {
  idTipoRecompensa: number = 0;
  formTipo!: FormGroup;

  constructor(
    private tS: Tiporecompensaservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 1. Recuperar el ID desde la URL (/tiporecompensas/editar/:id)
    this.idTipoRecompensa = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Crear el formulario (antes del return para que el HTML no falle)
    this.formTipo = this.fb.group({
      codigo: [this.idTipoRecompensa],
      nombreTipoRecompensa: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(50)]],
    });

    if (!this.idTipoRecompensa || isNaN(this.idTipoRecompensa)) {
      this.notificar('ID de tipo de recompensa inválido', 'error');
      return;
    }

    // 3. Cargar los datos actuales
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

  buscarPorId(): void {
    this.tS.listId(this.idTipoRecompensa).subscribe({
      next: (data: TipoRecompensaDTOList) => {
        this.formTipo.patchValue({
          codigo: data.idTipoRecompensa,
          nombreTipoRecompensa: data.nombreTipoRecompensa,
          descripcion: data.descripcion,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificar('No se encontró el tipo de recompensa', 'error');
      },
    });
  }

  actualizarTipo(): void {
    if (this.formTipo.invalid) {
      this.formTipo.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }

    const dto: TipoRecompensaDTOInsert = {
      nombreTipoRecompensa: this.formTipo.value.nombreTipoRecompensa.trim(),
      descripcion: this.formTipo.value.descripcion.trim(),
    };

    this.tS.update(this.idTipoRecompensa, dto).subscribe({
      next: () => {
        this.notificar('Tipo de recompensa actualizado correctamente', 'exito');
        this.router.navigate(['/tiporecompensas/listar']);
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Error al actualizar el tipo de recompensa', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
