import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOInsert } from '../../../models/RolDTOInsert';

@Component({
  selector: 'app-rolupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './rolupdatecomponent.html',
  styleUrl: './rolupdatecomponent.css',
})
export class Rolupdatecomponent {
    idRol: number = 0;
  formRol!: FormGroup;

  constructor(
    private rS: Rolservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 1. Recuperar el ID desde la URL (/roles/editar/:id)
    this.idRol = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Crear el formulario (antes del return para que el HTML no falle)
    this.formRol = this.fb.group({
      codigo: [this.idRol],
      nombre: ['', [Validators.required, Validators.pattern('^[A-Z_]+$')]],
      descripcion: ['', Validators.required],
    });

    if (!this.idRol || isNaN(this.idRol)) {
      this.notificar('ID de rol inválido', 'error');
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
    this.rS.listId(this.idRol).subscribe({
      next: (data: RolDTOInsert) => {
        this.formRol.patchValue({
          codigo: data.idRol,
          nombre: data.nombre.replace(/^ROLE_/, ''), // ROLE_ ya se muestra fijo
          descripcion: data.descripcion,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificar('No se encontró el rol', 'error');
      },
    });
  }

  // Convierte "supervisor de zona" en "SUPERVISOR_DE_ZONA"
  normalizarNombre(): void {
    const control = this.formRol.get('nombre');
    const valor = (control?.value ?? '')
      .toUpperCase()
      .replace(/^ROLE_/, '')
      .replace(/\s+/g, '_');
    control?.setValue(valor, { emitEvent: false });
  }

  actualizarRol(): void {
    if (this.formRol.invalid) {
      this.formRol.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }

    const dto: RolDTOInsert = {
      idRol: this.formRol.value.codigo,
      nombre: 'ROLE_' + this.formRol.value.nombre,
      descripcion: this.formRol.value.descripcion,
    };

    this.rS.update(dto).subscribe({
      next: () => {
        this.notificar('Rol actualizado correctamente', 'exito');
        this.router.navigate(['/roles/listar']); // la lista muestra el cambio (HUF06 CA05)
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Error al actualizar el rol', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
