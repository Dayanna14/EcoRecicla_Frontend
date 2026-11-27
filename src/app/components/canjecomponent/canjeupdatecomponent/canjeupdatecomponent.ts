import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CanjeDTOList } from '../../../models/CanjeDTOList';
import { RecompensaDTOList } from '../../../models/RecompensaDTOList';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { Canjeservice } from '../../../services/canjeservice';
import { RecompensaService } from '../../../services/recompensaservice';
import { UsuariosService } from '../../../services/usuariosservice';

@Component({
  selector: 'app-canjeupdatecomponent',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './canjeupdatecomponent.html',
  styleUrl: './canjeupdatecomponent.css',
})
export class Canjeupdatecomponent implements OnInit {
  estados = [
    { value: 'PENDIENTE', viewValue: 'Pendiente' },
    { value: 'COMPLETADO', viewValue: 'Completado' },
    { value: 'CANCELADO', viewValue: 'Cancelado' },
  ];

  listaRecompensas: RecompensaDTOList[] = [];
  listaUsuarios: UsuariosDTOList[] = [];

  idCanje: number = 0;
  formCanje: FormGroup;
  noEncontrado: boolean = false;
  guardando: boolean = false;
  private horaOriginal: string = '00:00:00'; // se conserva la hora del canje al guardar

  constructor(
    private canjeService: Canjeservice,
    private fb: FormBuilder,
    private rS: RecompensaService,
    private uS: UsuariosService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.formCanje = this.fb.group({
      fecha: ['', Validators.required],
      puntosUsados: ['', [Validators.required, Validators.min(1)]],
      estado: ['', Validators.required],
      idRecompensa: ['', Validators.required],
      idUsuario: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.idCanje = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.idCanje) {
      this.noEncontrado = true;
      return;
    }
    this.buscarPorId();
    this.listarRecompensas();
    this.listarUsuarios();
  }

  buscarPorId(): void {
    this.canjeService.listId(this.idCanje).subscribe({
      next: (data: CanjeDTOList) => {
        const fecha = String(data.fecha ?? '');
        this.horaOriginal = fecha.length > 11 ? fecha.slice(11, 19) : '00:00:00';
        this.formCanje.patchValue({
          fecha: fecha.slice(0, 10), // el input date usa AAAA-MM-DD
          puntosUsados: data.puntosUsados,
          estado: data.estado,
          idRecompensa: data.recompensaIdRecompensa,
          idUsuario: data.usuarioId_usuario,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.noEncontrado = true;
        this.cdr.detectChanges();
      },
    });
  }

  // Para el resumen de la derecha
  get recompensaElegida(): RecompensaDTOList | undefined {
    const id = this.formCanje.get('idRecompensa')?.value;
    return this.listaRecompensas.find(r => r.idRecompensa === id);
  }
  get usuarioElegido(): UsuariosDTOList | undefined {
    const id = this.formCanje.get('idUsuario')?.value;
    return this.listaUsuarios.find(u => u.id_usuario === id);
  }
  get nombreEstado(): string {
    const v = this.formCanje.get('estado')?.value;
    return this.estados.find(e => e.value === v)?.viewValue ?? '—';
  }

  sinImagen(ev: Event): void {
    (ev.target as HTMLImageElement).style.visibility = 'hidden';
  }

  listarRecompensas(): void {
    this.rS.list().subscribe({
      next: data => { this.listaRecompensas = data; this.cdr.detectChanges(); },
    });
  }

  listarUsuarios(): void {
    this.uS.list().subscribe({
      next: data => { this.listaUsuarios = data; this.cdr.detectChanges(); },
    });
  }

  actualizar(): void {
    if (this.formCanje.invalid || this.guardando) {
      this.formCanje.markAllAsTouched();
      return;
    }
    const v = this.formCanje.value;
    // El backend (PUT /api/canjes) espera idRecompensa e idUsuario, y fecha con hora
    const dto = {
      idCanje: this.idCanje,
      fecha: `${v.fecha}T${this.horaOriginal}`,
      puntosUsados: v.puntosUsados,
      estado: v.estado,
      idRecompensa: v.idRecompensa,
      idUsuario: v.idUsuario,
    };

    this.guardando = true;
    this.canjeService.update(dto as any).subscribe({
      next: () => {
        this.guardando = false;
        this.snackBar.open('Canje actualizado correctamente', 'Cerrar', { duration: 3000, panelClass: ['noti-exito'] });
        this.router.navigate(['/canjes/listar']);
      },
      error: (err) => {
        this.guardando = false;
        this.cdr.detectChanges();
        this.snackBar.open(err?.error?.message || 'No se pudo actualizar el canje', 'Cerrar', { duration: 5000, panelClass: ['noti-error'] });
      },
    });
  }
}
