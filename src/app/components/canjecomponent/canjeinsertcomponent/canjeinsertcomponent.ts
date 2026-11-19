import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CanjeDTOInsert } from '../../../models/CanjeDTOInsert';


@Component({
  selector: 'app-canjeinsertcomponent',
  imports: [
CommonModule,
  CommonModule,
CommonModule,
    ReactiveFormsModule,
    RouterLink,
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

  // Listas para los dropdowns (puedes tiparlas con tus interfaces correspondientes)
  usuarios: any[] = [];
  recompensas: any[] = [];
  
  estados = [
    { value: 'PENDIENTE', viewValue: 'Pendiente' },
    { value: 'COMPLETADO', viewValue: 'Completado' },
    { value: 'CANCELADO', viewValue: 'Cancelado' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
    // private canjeService: CanjeService,
    // private usuarioService: UsuarioService,
    // private recompensaService: RecompensaService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarListas();
  }

  initForm(): void {
    // Obtenemos la fecha actual en formato YYYY-MM-DD para el input date
    const fechaActual = new Date().toISOString().split('T')[0];

    this.form = this.formBuilder.group({
      fecha: [fechaActual, Validators.required],
      puntosUsados: [0, [Validators.required, Validators.min(1)]],
      idRecompensa: ['', Validators.required],
      Id_usuario: ['', Validators.required],
      estado: ['PENDIENTE', Validators.required]
    });
  }

  cargarListas(): void {
    // Datos de prueba temporales (reemplaza esto con tus llamadas reales al servicio)
    this.usuarios = [
      { id_usuario: 1, nombre: 'Ana Pérez', email: 'ana@mail.com' },
      { id_usuario: 2, nombre: 'Carlos Gómez', email: 'carlos@mail.com' }
    ];

    this.recompensas = [
      { idRecompensa: 1, nombre: 'Bono de S/ 20', puntosRequeridos: 100 },
      { idRecompensa: 2, nombre: 'Eco-termos', puntosRequeridos: 250 }
    ];
  }

  registrar(formDir: FormGroupDirective): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nuevoCanje: CanjeDTOInsert = this.form.value;


    console.log('Datos a registrar:', nuevoCanje);
    // Simulación de éxito temporal:
    this.router.navigate(['/canjes/registrar']);
  }
}
