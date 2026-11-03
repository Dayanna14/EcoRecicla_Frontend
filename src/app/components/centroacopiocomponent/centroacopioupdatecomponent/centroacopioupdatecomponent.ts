import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { CentroAcopioDTOInsert } from '../../../models/CentroAcopioDTOInsert';

@Component({
  selector: 'app-centroacopioupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './centroacopioupdatecomponent.html',
  styleUrl: './centroacopioupdatecomponent.css',
})
export class Centroacopioupdatecomponent {
    idCentro: number = 0;
  idUsuario: number = 0; // se conserva el usuario que ya tiene el centro
  formCentro!: FormGroup;

  estados = [
    { value: true, viewValue: 'Activo' },
    { value: false, viewValue: 'Inactivo' },
  ];

  constructor(
    private cS: Centroacopioservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 1. Recuperar el ID desde la URL (/centrosacopio/editar/:id)
    this.idCentro = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Crear el formulario
    this.formCentro = this.fb.group({
      codigo: [this.idCentro],
      nombre: ['', Validators.required],
      horario: ['', Validators.required],
      latitud: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitud: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      estado: [true, Validators.required],
    });

    if (!this.idCentro || isNaN(this.idCentro)) {
      this.notificar('ID de centro inválido', 'error');
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
    this.cS.listId(this.idCentro).subscribe({
      next: (data: CentroAcopioDTOInsert) => {
        this.idUsuario = data.idUsuario;
        this.formCentro.patchValue({
          codigo: data.idCentro,
          nombre: data.nombre,
          horario: data.horario,
          latitud: data.latitud,
          longitud: data.longitud,
          estado: data.estado,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificar('No se encontró el centro de acopio', 'error');
      },
    });
  }

  actualizarCentro(): void {
    if (this.formCentro.invalid) {
      this.formCentro.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }

    const dto: CentroAcopioDTOInsert = {
      idCentro: this.formCentro.value.codigo,
      idUsuario: this.idUsuario,
      nombre: this.formCentro.value.nombre,
      horario: this.formCentro.value.horario,
      latitud: this.formCentro.value.latitud,
      longitud: this.formCentro.value.longitud,
      estado: this.formCentro.value.estado,
    };

    this.cS.update(dto).subscribe({
      next: () => {
        this.notificar('Centro de acopio actualizado correctamente', 'exito');
        this.router.navigate(['/centrosacopio/listar']);
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Error al actualizar el centro de acopio', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
