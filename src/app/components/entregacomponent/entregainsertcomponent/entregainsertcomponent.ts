import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Clasificadorservice } from '../../../services/clasificadorservice';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Loginservice } from '../../../services/loginservice';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Entregaservice } from '../../../services/entregaservice';
import { EntregaDTOInsert } from '../../../models/EntregaDTOInsert';

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
    MatIconModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    RouterLink
  ],
  templateUrl: './entregainsertcomponent.html',
  styleUrl: './entregainsertcomponent.css',
})
export class Entregainsertcomponent implements OnInit, OnDestroy {
  // ===== Detectar el material con IA (misma IA del clasificador) =====
  @ViewChild('videoIA') videoIA?: ElementRef<HTMLVideoElement>;
  camaraIA: boolean = false;
  resultadoIA: string = '';
  private streamIA: MediaStream | null = null;
  private intervaloIA: any = null;
  private analizandoIA: boolean = false;
  ultimaClaseIA: string = '';
  ultimaConfianzaIA: number = 0;
  private historialIA: { clase: string; confianza: number }[][] = [];

  formEntrega!: FormGroup;
  mensaje: string = '';

  listaUsuarios: UsuariosDTOList[] = [];

  // ===== Buscador de reciclador =====
  // El operador no puede listar usuarios (solo el admin), así que se arma la lista
  // con los recicladores que ya tienen entregas (entregas + reporte detallado).
  recicladores: { id: number; nombre: string; email?: string; entregas: number }[] = [];
  busqueda = new FormControl<string>('', { nonNullable: true });
  codigoManual = new FormControl<number | null>(null);
  modoManual = false;
  elegido: { id: number; nombre: string; email?: string; entregas: number } | null = null;
  listaMateriales: MaterialDTOList[] = [];
  listaCentros: CentroAcopioDTOList[] = [];

  constructor(
    private entregaService: Entregaservice,
    private usuarioService: UsuariosService,
    private materialService: Materialservice,
    private centroAcopioService: Centroacopioservice,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private clasificador: Clasificadorservice,
    private loginService: Loginservice
  ) {
    this.formEntrega = this.formBuilder.group({
      idUsuario: ['', Validators.required],
      idMaterial: ['', Validators.required],
      idCentroAcopio: ['', Validators.required],
      cantidadKg: [0, [Validators.required, Validators.min(0.1)]]
    });
  }

  ngOnInit(): void {
    this.cargarCombos();
  }

  cargarCombos(): void {
    this.cargarRecicladores();
    this.materialService.list().subscribe(data => {
      this.listaMateriales = data;
      this.cdr.markForCheck();
    });
    this.centroAcopioService.list().subscribe(data => {
      this.listaCentros = data;
      this.cdr.markForCheck();
    });
  }

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMINISTRADOR']);
  }

  /** Lista de recicladores para el buscador */
  private cargarRecicladores(): void {
    forkJoin({
      entregas: this.entregaService.list().pipe(catchError(() => of([]))),
      detalle: this.entregaService.obtenerReporteDetallado().pipe(catchError(() => of([]))),
      usuarios: this.esAdmin ? this.usuarioService.list().pipe(catchError(() => of([]))) : of([] as UsuariosDTOList[]),
    }).subscribe(({ entregas, detalle, usuarios }) => {
      const nombrePorEntrega = new Map(detalle.map(d => [d.idEntrega, d.nombreUsuario]));
      const mapa = new Map<number, { id: number; nombre: string; email?: string; entregas: number }>();
      for (const e of entregas) {
        const id = e.usuarioIdUsuario;
        if (!id) continue;
        const r = mapa.get(id) ?? { id, nombre: nombrePorEntrega.get(e.idEntrega) ?? `Reciclador #${id}`, entregas: 0 };
        r.entregas++;
        mapa.set(id, r);
      }
      // El admin sí puede ver a todos los usuarios (incluye a los que aún no entregan)
      for (const u of usuarios) {
        const r = mapa.get(u.id_usuario) ?? { id: u.id_usuario, nombre: u.nombre, entregas: 0 };
        r.nombre = u.nombre;
        r.email = u.email;
        mapa.set(u.id_usuario, r);
      }
      this.recicladores = [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.cdr.detectChanges();
    });
  }

  /** Coincidencias por nombre, correo o código (#7 o 7) */
  get coincidencias() {
    const t = this.busqueda.value.trim().toLowerCase().replace(/^#/, '');
    if (!t) return this.recicladores.slice(0, 8);
    return this.recicladores.filter(r =>
      r.nombre.toLowerCase().includes(t) || (r.email ?? '').toLowerCase().includes(t) || String(r.id) === t
    ).slice(0, 8);
  }

  elegirReciclador(ev: MatAutocompleteSelectedEvent): void {
    const r = this.recicladores.find(x => x.id === ev.option.value);
    if (!r) return;
    this.elegido = r;
    this.formEntrega.get('idUsuario')?.setValue(r.id);
    this.busqueda.setValue('');
  }

  cambiarReciclador(): void {
    this.elegido = null;
    this.modoManual = false;
    this.codigoManual.setValue(null);
    this.formEntrega.get('idUsuario')?.setValue('');
  }

  activarManual(): void {
    this.modoManual = true;
    this.elegido = null;
    this.formEntrega.get('idUsuario')?.setValue('');
  }

  /** Código escrito a mano: si ya lo conocemos mostramos su nombre */
  aplicarCodigo(): void {
    const id = Number(this.codigoManual.value);
    if (!id || id < 1) {
      this.formEntrega.get('idUsuario')?.setValue('');
      return;
    }
    this.formEntrega.get('idUsuario')?.setValue(id);
  }

  get conocidoManual() {
    const id = Number(this.codigoManual.value);
    return this.recicladores.find(r => r.id === id);
  }

registrarEntrega() {
    if (this.formEntrega.invalid) {
      this.formEntrega.markAllAsTouched();
      this.mensaje = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    // Objeto limpio sin ceros en el ID ni en los puntos
    const entrega = {
      cantidadKg: Number(this.formEntrega.value.cantidadKg),
      idMaterial: Number(this.formEntrega.value.idMaterial),
      idCentroAcopio: Number(this.formEntrega.value.idCentroAcopio),
      idUsuario: Number(this.formEntrega.value.idUsuario)
    };

    this.entregaService.insert(entrega as any).subscribe({
      next: (response: any) => {
        const puntos = response?.puntosGeneredos || 0;
        
        this.snackBar.open(`¡Entrega registrada con éxito! Puntos generados: ${puntos}`, 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        this.formEntrega.reset();
        this.elegido = null;
        this.router.navigate(['/entregas/listar']);
      },
      error: (err) => {
        console.error('Ocurrió un error al insertar la entrega', err);
        // Si el código escrito no existe, el backend responde con error
        const motivo = err?.error?.message;
        this.mensaje = this.modoManual
          ? 'No se pudo registrar. Verifica que el código del reciclador sea correcto.'
          : (motivo || 'Ocurrió un error al registrar la entrega.');
        this.snackBar.open(this.mensaje, 'Cerrar', { duration: 4000 });
      }
    });
  }

  // ⚠️ NO ENSEÑADO EN CLASE: cámara con getUserMedia + modelo de Teachable Machine
  async detectarConIA(): Promise<void> {
    try {
      await this.clasificador.cargarModelo();
      this.streamIA = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      this.camaraIA = true;
      this.resultadoIA = '';
      this.cdr.detectChanges();
      const v = this.videoIA!.nativeElement;
      v.srcObject = this.streamIA;
      await v.play();
      this.intervaloIA = setInterval(() => this.analizarIA(), 500);
    } catch (err) {
      console.error('No se pudo usar la IA', err);
      this.snackBar.open('No se pudo abrir la cámara o cargar el modelo de IA', 'Cerrar', { duration: 4000 });
      this.cerrarCamaraIA();
    }
  }

  private async analizarIA(): Promise<void> {
    const v = this.videoIA?.nativeElement;
    if (!v || v.readyState < 2 || this.analizandoIA) return;
    this.analizandoIA = true;
    try {
      // Promedio de las últimas 6 lecturas para que el resultado no salte
      this.historialIA = [...this.historialIA, await this.clasificador.clasificar(v)].slice(-6);
      const suma = new Map<string, number>();
      this.historialIA.forEach(l => l.forEach(p => suma.set(p.clase, (suma.get(p.clase) ?? 0) + p.confianza)));
      const [clase, total] = [...suma.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
      this.ultimaClaseIA = clase;
      this.ultimaConfianzaIA = Math.round(total / this.historialIA.length);
    } finally {
      this.analizandoIA = false;
      this.cdr.detectChanges();
    }
  }

  // Elige en el formulario el material que reconoció la IA
  usarResultadoIA(): void {
    const quitar = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const clase = quitar(this.ultimaClaseIA);
    const material = this.listaMateriales.find(m => quitar(m.nombre).includes(clase) || clase.includes(quitar(m.nombre)));
    if (clase === 'nada' || !material) {
      this.resultadoIA = clase === 'nada'
        ? 'No se reconoció ningún material. Acerca el residuo a la cámara.'
        : `La IA vio "${this.ultimaClaseIA}", pero ese material no está registrado. Elígelo a mano.`;
    } else {
      this.formEntrega.get('idMaterial')?.setValue(material.idMaterial);
      this.resultadoIA = `Detectado por IA: ${material.nombre} (${this.ultimaConfianzaIA} %)`;
    }
    this.cerrarCamaraIA();
  }

  cerrarCamaraIA(): void {
    this.historialIA = [];
    if (this.intervaloIA) clearInterval(this.intervaloIA);
    this.intervaloIA = null;
    this.streamIA?.getTracks().forEach(t => t.stop());
    this.streamIA = null;
    this.camaraIA = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.cerrarCamaraIA();
  }
}
