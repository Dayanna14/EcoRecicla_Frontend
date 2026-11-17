import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormGroupDirective } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-canjeinsertcomponent',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './canjeinsertcomponent.html',
  styleUrl: './canjeinsertcomponent.css',
})
export class Canjeinsertcomponent implements OnInit {
  form!: FormGroup;

  // Listas de datos para los selects (puedes reemplazarlas con llamadas a tus servicios)
  usuarios: any[] = [
    { id_usuario: 1, nombre: 'Ana Gómez', email: 'ana.gomez@email.com' },
    { id_usuario: 2, nombre: 'Carlos Pérez', email: 'carlos.perez@email.com' }
  ];

  recompensas: any[] = [
    { id_recompensa: 1, nombre: 'Bono S/ 20 de descuento', puntos_requeridos: 150 },
    { id_recompensa: 2, nombre: 'Eco-mochila reciclada', puntos_requeridos: 300 },
    { id_recompensa: 3, nombre: 'Kit de productos ecológicos', puntos_requeridos: 500 }
  ];

  centrosAcopio: any[] = [
    { id_centro: 1, nombre: 'Centro Miraflores' },
    { id_centro: 2, nombre: 'Centro San Isidro' }
  ];

  estados = [
    { value: 'PENDIENTE', viewValue: 'Pendiente' },
    { value: 'COMPLETADO', viewValue: 'Completado' },
    { value: 'CANCELADO', viewValue: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      idUsuario: [null, Validators.required],
      idRecompensa: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      idCentroAcopio: [null, Validators.required],
      estado: ['PENDIENTE', Validators.required]
    });
  }

  registrar(formDir: FormGroupDirective): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nuevoCanje = this.form.value;
    console.log('Datos del canje a registrar:', nuevoCanje);

    // Simulación de navegación exitosa por ahora:
    alert('¡Canje registrado correctamente!');
    this.router.navigate(['/canjes/listar']);
  }
}
