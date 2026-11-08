import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Entregaservice } from '../../../services/entregaservice';
import { EntregaDTOInsert } from '../../../models/EntregaDTOInsert';



// --- COMENTADO TEMPORALMENTE HASTA QUE TUS COMPAÑEROS LOS CREEN ---
// import { Usuarioservice } from '../../services/usuarioservice';
// import { Materialservice } from '../../services/materialservice';
// import { Centroacopioservice } from '../../services/centroacopioservice';

@Component({
  selector: 'app-entregainsertcomponent',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './entregainsertcomponent.html',
  styleUrl: './entregainsertcomponent.css',
})
export class Entregainsertcomponent implements OnInit {
  formEntrega!: FormGroup;
  mensaje: string = '';

  // Listas temporales de prueba para que el mat-select no falle visualmente
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
    // private usuarioService: Usuarioservice,      // <-- Comentado
    // private materialService: Materialservice,    // <-- Comentado
    // private centroAcopioService: Centroacopioservice, // <-- Comentado
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Definición del formulario reactivo
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
    /* 
      TODO: Descomentar cuando tus compañeros terminen sus servicios
      this.usuarioService.list().subscribe(data => this.listaUsuarios = data);
      this.materialService.list().subscribe(data => this.listaMateriales = data);
      this.centroAcopioService.list().subscribe(data => this.listaCentros = data);
    */
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

    // Envía los datos reales al POST de tu backend que ya tienes listo
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