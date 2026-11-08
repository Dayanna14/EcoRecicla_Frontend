import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { EntregaDTOInsert } from '../../../models/EntregaDTOInsert';
import { Entregaservice } from '../../../services/entregaservice';



@Component({
  selector: 'app-entregaupdatecomponent',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './entregaupdatecomponent.html',
  styleUrl: './entregaupdatecomponent.css'
})
export class Entregaupdatecomponent implements OnInit {
  formEntrega!: FormGroup;
  id: number = 0;
  mensaje: string = '';

  // Listas temporales o de tus servicios cuando los integres
  listaUsuarios: any[] = [
    { id_usuario: 1, nombre: 'Usuario de Prueba 1' }
  ];
  listaMateriales: any[] = [
    { idMaterial: 1, nombreMaterial: 'Plástico (Prueba)' }
  ];
  listaCentros: any[] = [
    { idCentro: 1, nombreCentro: 'Centro de Acopio (Prueba)' }
  ];

  constructor(
    private entregaService: Entregaservice,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Capturamos el ID de la URL (ej. /entregas/editar/5)
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      this.initForm();
    });
  }

  initForm(): void {
    this.formEntrega = this.formBuilder.group({
      idEntrega: [this.id, Validators.required],
      idUsuario: ['', Validators.required],
      idMaterial: ['', Validators.required],
      idCentroAcopio: ['', Validators.required],
      cantidadKg: [0, [Validators.required, Validators.min(0.1)]],
      puntosGenerados: [0]
    });

    // Cargamos los datos actuales para rellenar el formulario
    this.entregaService.listId(this.id).subscribe({
      next: (data: any) => {
        this.formEntrega.patchValue({
          idEntrega: data.idEntrega,
          idUsuario: data.usuarioIdUsuario || data.idUsuario,
          idMaterial: data.materialIdMaterial || data.idMaterial,
          idCentroAcopio: data.centroAcopioIdCentroAcopio || data.idCentroAcopio,
          cantidadKg: data.cantidadKg,
          puntosGenerados: data.puntosGenerados
        });
      },
      error: (err) => {
        console.error('Error al cargar la entrega para actualizar', err);
        this.mensaje = 'No se pudo cargar la información de la entrega.';
      }
    });
  }

  actualizarEntrega(): void {
    if (this.formEntrega.invalid) {
      this.mensaje = 'Por favor, completa todos los campos correctamente.';
      return;
    }

const entrega: EntregaDTOInsert = {
      idEntrega: this.formEntrega.value.idEntrega,
      cantidadKg: this.formEntrega.value.cantidadKg,
      puntosGenerados: this.formEntrega.value.puntosGenerados || 0,
      fecha: new Date(), // <--- ¡Faltaba agregar esto aquí también!
      idMaterial: this.formEntrega.value.idMaterial,
      idCentroAcopio: this.formEntrega.value.idCentroAcopio,
      idUsuario: this.formEntrega.value.idUsuario
    };

    this.entregaService.update(entrega).subscribe({
      next: () => {
        this.snackBar.open('¡Entrega actualizada con éxito!', 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.router.navigate(['/entregas/listar']);
      },
      error: (err) => {
        console.error('Error al actualizar la entrega', err);
        this.mensaje = 'Ocurrió un error al actualizar la entrega.';
        this.snackBar.open('Error al actualizar la entrega', 'Cerrar', { duration: 3000 });
      }
    });
  }
}