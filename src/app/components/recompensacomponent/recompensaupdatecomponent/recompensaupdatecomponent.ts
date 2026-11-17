import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecompensaService } from '../../../services/recompensaservice';
import { Tiporecompensaservice } from '../../../services/tiporecompensaservice';
import { RecompensaDTOList } from '../../../models/RecompensaDTOList';
import { RecompensaDTOInsert } from '../../../models/RecompensaDTOInsert';
import { TipoRecompensaDTOList } from '../../../models/TipoRecompensaDTOList';

@Component({
  selector: 'app-recompensaupdatecomponent',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, RouterLink],
  templateUrl: './recompensaupdatecomponent.html',
  styleUrl: './recompensaupdatecomponent.css',
})
export class Recompensaupdatecomponent implements OnInit {
  idRecompensa: number = 0;
  formRecompensa!: FormGroup;
  tipos: TipoRecompensaDTOList[] = [];
  estados: any[] = [
    { value: true, viewValue: 'Activa' },
    { value: false, viewValue: 'Inactiva' },
  ];

  constructor(
    private rS: RecompensaService,
    private tS: Tiporecompensaservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.idRecompensa = Number(this.route.snapshot.paramMap.get('id'));

    this.formRecompensa = this.fb.group({
      codigo: [this.idRecompensa],
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      costoPuntos: [null, [Validators.required, Validators.min(1)]],
      estado: ['', Validators.required],
      imagenUrl: ['', Validators.required],
    });

    if (!this.idRecompensa || isNaN(this.idRecompensa)) {
      this.notificar('ID de recompensa inválido', 'error');
      return;
    }

    this.buscarPorId();
    this.listarTipos();
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['noti-' + tipo],
    });
  }

  listarTipos(): void {
    this.tS.list().subscribe({
      next: data => {
        this.tipos = data;
        this.cdr.detectChanges();
      },
    });
  }

  buscarPorId(): void {
    this.rS.listId(this.idRecompensa).subscribe({
      next: (data: RecompensaDTOList) => {
        this.formRecompensa.patchValue({
          codigo: data.idRecompensa,
          nombre: data.nombre,
          tipo: data.idTipoRecompensa,
          costoPuntos: data.costoPuntos,
          estado: data.estado,
          imagenUrl: data.imagenUrl,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificar('No se encontró la recompensa', 'error');
      },
    });
  }

  actualizarRecompensa(): void {
    if (this.formRecompensa.invalid) {
      this.formRecompensa.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }

    const dto: RecompensaDTOInsert = {
      idRecompensa: this.formRecompensa.value.codigo,
      nombre: this.formRecompensa.value.nombre,
      idTipoRecompensa: this.formRecompensa.value.tipo,
      costoPuntos: this.formRecompensa.value.costoPuntos,
      estado: this.formRecompensa.value.estado,
      imagenUrl: this.formRecompensa.value.imagenUrl,
    };

    this.rS.update(dto).subscribe({
      next: () => {
        this.notificar('Recompensa actualizada correctamente', 'exito');
        this.router.navigate(['/recompensas/listar']);
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Error al actualizar la recompensa', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}