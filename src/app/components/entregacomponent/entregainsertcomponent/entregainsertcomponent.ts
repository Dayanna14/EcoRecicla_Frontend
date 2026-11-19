import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Entregaservice } from '../../../services/entregaservice';
import { EntregaDTOInsert } from '../../../models/EntregaDTOInsert';

// Servicios y Modelos para cargar los nombres reales en los combos
import { UsuariosService } from '../../../services/usuariosservice';
import { Materialservice } from '../../../services/materialservice';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { MaterialDTOList } from '../../../models/MaterialDTOList';
import { CentroAcopioDTOList } from '../../../models/CentroAcopioDTOList';

@Component({
  selector: 'app-entregainsertcomponent',
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
  templateUrl: './entregainsertcomponent.html',
  styleUrl: './entregainsertcomponent.css',
})
export class Entregainsertcomponent implements OnInit {
  formEntrega!: FormGroup;
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
    private snackBar: MatSnackBar
  ) {
    this.formEntrega = this.formBuilder.group({
      idUsuario: ['', Validators.required],
      idMaterial: ['', Validators.required],
      idCentroAcopio: ['', Validators.required],
      cantidadKg: [0, [Validators.required, Validators.min(0.1)]],
      puntosGenerados: [0]
    });
  }

  ngOnInit(): void {
    this.cargarCombos();
  }

  cargarCombos(): void {
    this.usuarioService.list().subscribe(data => this.listaUsuarios = data);
    this.materialService.list().subscribe(data => this.listaMateriales = data);
    this.centroAcopioService.list().subscribe(data => this.listaCentros = data);
  }

  registrarEntrega() {
    if (this.formEntrega.invalid) {
      this.mensaje = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    const entrega: EntregaDTOInsert = {
      idEntrega: 0,
      cantidadKg: this.formEntrega.value.cantidadKg,
      puntosGenerados: this.formEntrega.value.puntosGenerados || 0,
      fecha: new Date(),
      idMaterial: this.formEntrega.value.idMaterial,
      idCentroAcopio: this.formEntrega.value.idCentroAcopio,
      idUsuario: this.formEntrega.value.idUsuario
    };

    this.entregaService.insert(entrega).subscribe({
      next: (response: any) => {
        const puntos = response?.puntosGenerados || entrega.puntosGenerados;
        
        this.snackBar.open(`¡Entrega registrada con éxito! Puntos generados: ${puntos}`, 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        this.formEntrega.reset();
        this.router.navigate(['/entregas/listar']);
      },
      error: (err) => {
        console.error('Ocurrió un error al insertar la entrega', err);
        this.mensaje = 'Ocurrió un error al registrar la entrega.';
        this.snackBar.open('Error al registrar la entrega', 'Cerrar', { duration: 3000 });
      }
    });
  }
}