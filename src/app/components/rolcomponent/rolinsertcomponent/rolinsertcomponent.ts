import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOInsert } from '../../../models/RolDTOInsert';
import { RolDTOList } from '../../../models/RolDTOList';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rolinsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './rolinsertcomponent.html',
  styleUrl: './rolinsertcomponent.css',
})
export class Rolinsertcomponent implements OnInit {
  form: FormGroup;
  guardando: boolean = false;

  // Modo edición (HUF06)
  edicion: boolean = false;
  id: number = 0;
  rolesSistema: string[] = ['ROLE_ADMINISTRADOR', 'ROLE_OPERADOR_CENTRO', 'ROLE_RECICLADOR'];
  esRolSistema: boolean = false;

  constructor(
    private fb: FormBuilder,
    private rS: Rolservice,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[A-Z_]+$')]],
      descripcion: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Si la URL trae :id → editar; si no → registrar
    this.route.params.subscribe(params => {
      this.edicion = params['id'] != null;
      if (this.edicion) {
        this.id = Number(params['id']);
        this.cargarRol();
      }
    });
  }

  // Precarga el formulario con los datos actuales (CA02)
  cargarRol(): void {
    this.rS.listId(this.id).subscribe({
      next: rol => {
        this.esRolSistema = this.rolesSistema.includes(rol.nombre);
        this.form.patchValue({
          nombre: rol.nombre.replace(/^ROLE_/, ''), // el prefijo ya se muestra fijo
          descripcion: rol.descripcion,
        });
        if (this.esRolSistema) {
          this.form.get('nombre')?.disable();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('No se encontró el rol', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/roles/listar']);
      },
    });
  }

  // Convierte "supervisor de zona" en "SUPERVISOR_DE_ZONA"
  normalizarNombre(): void {
    const control = this.form.get('nombre');
    const valor = control?.value
      .toUpperCase()
      .replace(/^ROLE_/, '')
      .replace(/\s+/g, '_');
    control?.setValue(valor, { emitEvent: false });
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const valores = this.form.getRawValue(); // incluye el nombre aunque esté deshabilitado
    const rol = {
      nombre: 'ROLE_' + valores.nombre,
      descripcion: valores.descripcion,
    } as RolDTOInsert;

    // Editar → PUT con idRol ; Registrar → POST sin idRol
    if (this.edicion) {
      rol.idRol = this.id;
    }
    const peticion = this.edicion ? this.rS.update(rol) : this.rS.insert(rol);
    const mensajeOk = this.edicion ? 'Rol actualizado correctamente' : 'Rol registrado correctamente';

    peticion.subscribe({
      next: () => {
        this.snackBar.open(mensajeOk, 'OK', { duration: 3000 });
        this.router.navigate(['/roles/listar']);
      },
      error: err => {
        this.guardando = false;
        const mensaje = err.error?.message ?? 'No se pudo guardar el rol';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        this.cdr.detectChanges();
      },
    });
  }
}