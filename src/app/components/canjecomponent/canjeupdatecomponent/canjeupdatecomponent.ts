import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { CanjeDTOInsert } from '../../../models/CanjeDTOInsert';
import { CanjeDTOList } from '../../../models/CanjeDTOList';
import { Canjeservice } from '../../../services/canjeservice';
import { RecompensaService } from '../../../services/recompensaservice';
import { UsuariosService } from '../../../services/usuariosservice';

@Component({
  selector: 'app-canjeupdatecomponent',
  imports: [MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    ReactiveFormsModule],
  templateUrl: './canjeupdatecomponent.html',
  styleUrl: './canjeupdatecomponent.css',
})
export class Canjeupdatecomponent implements OnInit {
  estados: any[] = [
    { value: 'PENDIENTE', viewValue: 'Pendiente' },
    { value: 'ENTREGADO', viewValue: 'Entregado' },
    { value: 'CANCELADO', viewValue: 'Cancelado' },
  ];

  listaRecompensas: any[] = [];
  listaUsuarios: any[] = [];

  idCanje: any = null;
  formCanje!: FormGroup;
  mensaje: string = '';

  constructor(
    private canjeService: Canjeservice,
    private fb: FormBuilder,
    private rS: RecompensaService,
    private uS: UsuariosService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idCanje = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.idCanje || isNaN(this.idCanje)) {
      this.mensaje = 'ID de canje inválido';
      return;
    }

    this.formCanje = this.fb.group({
      idCanje: [],
      fecha: [new Date(), Validators.required],
      puntosUsados: ['', Validators.required],
      estado: ['', Validators.required],
      idRecompensa: ['', Validators.required],
      Id_usuario: ['', Validators.required],
    });

    this.buscarPorId();
    this.listarRecompensas();
    this.listarUsuarios();
  }

  buscarPorId(): void {
    this.canjeService.listId(this.idCanje).subscribe({
      next: (data: CanjeDTOList) => {
        console.log('Canje encontrado:', data);

        this.formCanje.patchValue({
          idCanje: data.idCanje,
          fecha: data.fecha,
          puntosUsados: data.puntosUsados,
          estado: data.estado,
          idRecompensa: data.recompensaIdRecompensa,
          Id_usuario: data.usuarioId_usuario,
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar canje', error);
        this.mensaje = 'No se encontró el canje';
      },
    });
  }

  listarRecompensas(): void {
    this.rS.list().subscribe({
      next: (data) => {
        this.listaRecompensas = data;
        this.cdr.detectChanges();
      },
    });
  }

  listarUsuarios(): void {
    this.uS.list().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
        this.cdr.detectChanges();
      },
    });
  }

  actualizar(): void {
    if (this.formCanje.invalid) {
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    // El backend (PUT /api/canjes) espera idRecompensa e idUsuario
    const dto = {
      idCanje: this.formCanje.value.idCanje,
      fecha: this.formCanje.value.fecha,
      puntosUsados: this.formCanje.value.puntosUsados,
      estado: this.formCanje.value.estado,
      idRecompensa: this.formCanje.value.idRecompensa,
      idUsuario: this.formCanje.value.Id_usuario,
    };

    this.canjeService.update(dto as any).subscribe({
      next: () => {
        this.mensaje = 'Canje actualizado correctamente';
        this.cdr.detectChanges();
        this.formCanje.reset({
          fecha: new Date(),
          puntosUsados: '',
          estado: '',
          idRecompensa: '',
          Id_usuario: '',
        });
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar el canje';
      },
    });
  }
}
