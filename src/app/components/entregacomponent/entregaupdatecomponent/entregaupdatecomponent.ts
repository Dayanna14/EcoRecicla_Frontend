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

// Servicios y Modelos para cargar los nombres reales en los combos
import { UsuariosService } from '../../../services/usuariosservice';
import { Materialservice } from '../../../services/materialservice';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { MaterialDTOList } from '../../../models/MaterialDTOList';
import { CentroAcopioDTOList } from '../../../models/CentroAcopioDTOList';

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

  // Listas tipadas para los mat-select
  listaUsuarios: UsuariosDTOList[] = [];
  listaMateriales: MaterialDTOList[] = [];
  listaCentros: CentroAcopioDTOList[] = [];

  constructor(
    private entregaService: Entregaservice,
    private usuarioService: UsuariosService,
    private materialService: Materialservice,
    private centroAcopioService: Centroacopioservice,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // 1. Cargamos los combos primero para que las opciones estén listas en el select
    this.cargarCombos();

    // 2. Capturamos el ID de la URL (ej. /entregas/editar/5)
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      this.initForm();
    });
  }

  cargarCombos(): void {
    this.usuarioService.list().subscribe(data => this.listaUsuarios = data);
    this.materialService.list().subscribe(data => this.listaMateriales = data);
    this.centroAcopioService.list().subscribe(data => this.listaCentros = data);
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

    // Cargamos los datos actuales de la entrega para rellenar el formulario
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
      puntosGeneredos: this.formEntrega.value.puntosGenerados || 0,
      fecha: new Date().toISOString(),
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