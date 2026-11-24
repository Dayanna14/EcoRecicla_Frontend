import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { CanjeDTOInsert } from '../../../models/CanjeDTOInsert';
import { RecompensaDTOList } from '../../../models/RecompensaDTOList';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { Canjeservice } from '../../../services/canjeservice';
import { RecompensaService } from '../../../services/recompensaservice';
import { UsuariosService } from '../../../services/usuariosservice';
import { Entregaservice } from '../../../services/entregaservice';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-canjeinsertcomponent',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './canjeinsertcomponent.html',
  styleUrl: './canjeinsertcomponent.css',
})
export class Canjeinsertcomponent implements OnInit {
  form!: FormGroup;
  recompensas: RecompensaDTOList[] = [];
  usuarios: UsuariosDTOList[] = [];
  // Reciclador: su id se obtiene con sus entregas (el backend no lo envía en el login)
  miId: number | null = null;
  avisoReciclador: string = '';
  cargando = true;
  // Puntos disponibles = puntos de sus entregas - puntos de sus canjes (igual que valida el backend)
  misPuntos: number | null = null;

  estados = [
    { value: 'PENDIENTE', viewValue: 'Pendiente' },
    { value: 'COMPLETADO', viewValue: 'Completado' },
    { value: 'CANCELADO', viewValue: 'Cancelado' },
  ];

  constructor(
    private fb: FormBuilder,
    private canjeService: Canjeservice,
    private recompensaService: RecompensaService,
    private usuarioService: UsuariosService,
    private entregaService: Entregaservice,
    private loginService: Loginservice,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMINISTRADOR']);
  }

  ngOnInit(): void {
    const hoy = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      fecha: [hoy, Validators.required],
      idRecompensa: ['', Validators.required],
      puntosUsados: [{ value: '', disabled: true }],
      idUsuario: ['', Validators.required],
      estado: ['PENDIENTE', Validators.required],
    });

    // Los puntos son el costo de la recompensa elegida
    this.form.get('idRecompensa')?.valueChanges.subscribe(id => {
      const rec = this.recompensas.find(r => r.idRecompensa === id);
      this.form.get('puntosUsados')?.setValue(rec ? rec.costoPuntos : '');
    });

    this.recompensaService.list().subscribe({
      next: data => {
        this.recompensas = data.filter(r => r.estado);
        // Si viene desde el catálogo (?recompensa=id), se deja elegida
        const pre = Number(this.route.snapshot.queryParamMap.get('recompensa'));
        if (pre && this.recompensas.some(r => r.idRecompensa === pre)) {
          this.form.get('idRecompensa')?.setValue(pre);
        }
        this.cdr.detectChanges();
      },
      error: err => console.error('Error al cargar recompensas:', err),
    });

    if (this.esAdmin) {
      this.usuarioService.list().subscribe({
        next: data => { this.usuarios = data; this.cdr.detectChanges(); },
        error: err => console.error('Error al cargar usuarios:', err),
      });
    } else {
      // El reciclador canjea para sí mismo y el canje queda pendiente
      this.form.get('estado')?.disable();
      forkJoin({
        entregas: this.entregaService.list(),
        detalle: this.entregaService.obtenerReporteDetallado(),
        canjes: this.canjeService.list(),
      }).subscribe({
        next: ({ entregas, detalle, canjes }) => {
          const yo = this.loginService.getNombre().trim().toLowerCase();
          const misIds = new Set(detalle.filter(d => (d.nombreUsuario ?? '').trim().toLowerCase() === yo).map(d => d.idEntrega));
          this.miId = entregas.find(e => misIds.has(e.idEntrega))?.usuarioIdUsuario ?? null;
          if (this.miId !== null) {
            this.form.get('idUsuario')?.setValue(this.miId);
            const ganados = entregas.filter(e => e.usuarioIdUsuario === this.miId)
              .reduce((t, e) => t + (e.puntosGeneredos ?? 0), 0);
            const gastados = canjes.filter(c => c.usuarioId_usuario === this.miId)
              .reduce((t, c) => t + (c.puntosUsados ?? 0), 0);
            this.misPuntos = ganados - gastados;
          } else {
            this.avisoReciclador = 'Aún no tienes entregas registradas, así que todavía no puedes canjear.';
          }
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error al cargar tus datos:', err);
          this.avisoReciclador = 'No se pudieron cargar tus puntos. Intenta de nuevo en unos segundos.';
          this.cargando = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  /** Recompensa elegida en el formulario (para la vista previa) */
  get seleccionada(): RecompensaDTOList | undefined {
    const id = this.form?.get('idRecompensa')?.value;
    return this.recompensas.find(r => r.idRecompensa === id);
  }

  /** Puntos que le quedarían al reciclador después del canje */
  get restantes(): number | null {
    const r = this.seleccionada;
    return this.misPuntos !== null && r ? this.misPuntos - r.costoPuntos : null;
  }

  /** Porcentaje de sus puntos que usa este canje (para la barra) */
  get porcentajeUso(): number {
    const r = this.seleccionada;
    if (!r || !this.misPuntos || this.misPuntos <= 0) return 0;
    return Math.min(100, Math.round((r.costoPuntos / this.misPuntos) * 100));
  }

  /** Recompensas que puede pagar, de la más cara a la más barata (máx. 6) */
  get sugeridas(): RecompensaDTOList[] {
    return this.recompensas.filter(r => this.alcanza(r.costoPuntos))
      .sort((a, b) => b.costoPuntos - a.costoPuntos).slice(0, 6);
  }

  elegir(r: RecompensaDTOList): void {
    this.form.get('idRecompensa')?.setValue(r.idRecompensa);
  }

  sinImagen(ev: Event): void {
    (ev.target as HTMLImageElement).style.visibility = 'hidden';
  }

  /** El reciclador no puede elegir una recompensa que cuesta más de lo que tiene */
  alcanza(costo: number): boolean {
    return this.esAdmin || (this.misPuntos !== null && costo <= this.misPuntos);
  }

  registrar(formDir: FormGroupDirective): void {
    const rec = this.recompensas.find(r => r.idRecompensa === this.form.get('idRecompensa')?.value);
    if (rec && !this.alcanza(rec.costoPuntos)) {
      this.snackBar.open(`No te alcanzan los puntos: tienes ${this.misPuntos} y necesitas ${rec.costoPuntos}`, 'Cerrar', { duration: 4000, panelClass: ['noti-error'] });
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Completa todos los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }
    const valores = this.form.getRawValue();
    const ahora = new Date().toTimeString().substring(0, 8); // HH:mm:ss
    const dto: CanjeDTOInsert = {
      idCanje: null, // vacío: el backend genera el id (con 0 JPA intenta actualizar un canje que no existe)
      fecha: `${valores.fecha}T${ahora}`, // el backend espera fecha y hora
      puntosUsados: Number(valores.puntosUsados),
      estado: valores.estado,
      idRecompensa: Number(valores.idRecompensa),
      idUsuario: Number(valores.idUsuario),
    };
    this.canjeService.insert(dto as any).subscribe({
      next: () => {
        this.snackBar.open('Canje registrado correctamente', 'Cerrar', { duration: 3000, panelClass: ['noti-exito'] });
        formDir.resetForm();
        this.router.navigate(['/canjes/listar']);
      },
      error: err => {
        console.error('Error al registrar el canje:', err);
        // El backend explica el motivo (p. ej. "Puntos insuficientes. Disponibles: 20, necesarios: 100")
        const motivo = err?.error?.message;
        this.snackBar.open(motivo ? motivo : 'No se pudo registrar el canje', 'Cerrar', { duration: 5000, panelClass: ['noti-error'] });
      },
    });
  }
}
