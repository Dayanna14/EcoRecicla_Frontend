import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Materialservice } from '../../../services/materialservice';
import { MaterialDTOInsert } from '../../../models/MaterialDTOInsert';
import { MaterialDTOList } from '../../../models/MaterialDTOList';

@Component({
  selector: 'app-materialupdatecomponent',
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
  templateUrl: './materialupdatecomponent.html',
  styleUrl: './materialupdatecomponent.css',
})
export class Materialupdatecomponent implements OnInit {
  idMaterial: number = 0;
  formMaterial!: FormGroup;

  constructor(
    private mS: Materialservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 1. Recuperar el ID desde la URL (/materiales/editar/:id)
    this.idMaterial = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Crear el formulario (antes del return para que el HTML no falle)
    this.formMaterial = this.fb.group({
      codigo: [this.idMaterial],
      nombre: ['', Validators.required],
      puntosPorKg: ['', [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
      factorCo2: ['', [Validators.required, Validators.min(0)]],
      descripcion: [''],
      estado: [true],
    });

    if (!this.idMaterial || isNaN(this.idMaterial)) {
      this.notificar('ID de material inválido', 'error');
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
    this.mS.listId(this.idMaterial).subscribe({
      next: (data: MaterialDTOList) => {
        this.formMaterial.patchValue({
          codigo: data.idMaterial,
          nombre: data.nombre,
          puntosPorKg: data.puntosPorKg,
          factorCo2: data.factorCo2,
          descripcion: data.descripcion,
          estado: data.estado,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificar('No se encontró el material', 'error');
      },
    });
  }

  actualizarMaterial(): void {
    if (this.formMaterial.invalid) {
      this.formMaterial.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }

    const dto: MaterialDTOInsert = {
      nombre: this.formMaterial.value.nombre.trim(),
      puntosPorKg: Number(this.formMaterial.value.puntosPorKg),
      factorCo2: Number(this.formMaterial.value.factorCo2),
      descripcion: this.formMaterial.value.descripcion,
      estado: this.formMaterial.value.estado,
    };

    this.mS.update(this.idMaterial, dto).subscribe({
      next: () => {
        this.notificar('Material actualizado correctamente', 'exito');
        this.router.navigate(['/materiales/listar']);
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Error al actualizar el material', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
