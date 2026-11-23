import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CanjeDTOInsert } from '../../../models/CanjeDTOInsert';
import { Canjeservice } from '../../../services/canjeservice';
import { RecompensaService } from '../../../services/recompensaservice';
import { UsuariosService } from '../../../services/usuarioservice';


@Component({
  selector: 'app-canjeinsertcomponent',
  imports: [CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule],
  templateUrl: './canjeinsertcomponent.html',
  styleUrl: './canjeinsertcomponent.css',
})
export class Canjeinsertcomponent implements OnInit {
form!: FormGroup;
  recompensas: any[] = [];
  usuarios: any[] = [];

  estados = [
    { value: 'PENDIENTE', viewValue: 'Pendiente' },
    { value: 'ENTREGADO', viewValue: 'Entregado' },
    { value: 'CANCELADO', viewValue: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private canjeService: Canjeservice,
    // 2. INYECTA AMBOS SERVICIOS EN EL CONSTRUCTOR
    private recompensaService: RecompensaService,
    private usuarioService: UsuariosService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      fecha: [hoy, Validators.required],
      puntosUsados: ['', [Validators.required, Validators.min(1)]],
      idRecompensa: ['', Validators.required],
      Id_usuario: ['', Validators.required],
      estado: ['PENDIENTE', Validators.required]
    });

    // 3. LLAMA A LOS MÉTODOS LIST() PARA LLENAR LOS SELECTS
    this.recompensaService.list().subscribe({
      next: (data) => {
        this.recompensas = data;
      },
      error: (err) => console.error('Error al cargar recompensas:', err)
    });

    this.usuarioService.list().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  registrar(formDir: FormGroupDirective): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Completa todos los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    const dto: CanjeDTOInsert = {
      idCanje: 0,
      fecha: this.form.value.fecha,
      puntosUsados: Number(this.form.value.puntosUsados),
      estado: this.form.value.estado,
      idRecompensa: Number(this.form.value.idRecompensa),
      Id_usuario: Number(this.form.value.Id_usuario)
    };

    this.canjeService.insert(dto as any).subscribe({
      next: () => {
        this.snackBar.open('Canje registrado correctamente', 'Cerrar', { duration: 3000 });
        formDir.resetForm();
        this.router.navigate(['/canjes']);
      },
      error: (err) => {
        console.error('Error al registrar el canje:', err);
        this.snackBar.open('Error al registrar el canje', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
