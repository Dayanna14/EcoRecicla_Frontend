import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import * as L from 'leaflet';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { UsuariosService } from '../../../services/usuariosservice';
import { Nominatimservice } from '../../../services/nominatimservice';
import { CentroAcopioDTOInsert } from '../../../models/CentroAcopioDTOInsert';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  selector: 'app-centroacopioinsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
    MatTimepickerModule,
  ],
  templateUrl: './centroacopioinsertcomponent.html',
  styleUrl: './centroacopioinsertcomponent.css',
  providers: [provideNativeDateAdapter()],
})
export class Centroacopioinsertcomponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  usuarios: UsuariosDTOList[] = [];
  direccion: string = '';
  private nombreAutomatico: string = ''; // último nombre que puso el mapa

  estados = [
    { value: true, viewValue: 'Activo' },
    { value: false, viewValue: 'Inactivo' },
  ];

  private mapa!: L.Map;
  private marcador: L.Marker | null = null;
  private readonly LIMA: L.LatLngTuple = [-12.0464, -77.0428];
  private icono = L.icon({
    iconUrl: 'img/mapa/pin-activo.svg',
    iconSize: [36, 48],
    iconAnchor: [18, 45],
  });

  constructor(
    private fb: FormBuilder,
    private cS: Centroacopioservice,
    private uS: UsuariosService,
    private nS: Nominatimservice,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apertura: [this.aFecha('08:00'), Validators.required],
      cierre: [this.aFecha('18:00'), Validators.required],
      estado: [true, Validators.required],
      idUsuario: [null, Validators.required],
      latitud: [null, Validators.required],
      longitud: [null, Validators.required],
    });
  }

  // Carga los usuarios para el mat-select (servicio de Nayara)
  ngOnInit(): void {
    this.uS.list().subscribe({
      next: data => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: () => this.notificar('No se pudieron cargar los usuarios', 'error'),
    });
  }

  // El mapa se crea cuando el <div id="mapaRegistro"> ya existe
  ngAfterViewInit(): void {
    this.mapa = L.map('mapaRegistro').setView(this.LIMA, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.mapa);

    // HUF22 CA02 y CA03: clic en el mapa = ubicación del centro
    this.mapa.on('click', (e: L.LeafletMouseEvent) => this.marcarUbicacion(e.latlng));
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
    });
  }
    // "08:00" → objeto Date (el timepicker trabaja con Date)
  aFecha(hora: string): Date | null {
    const m = /^(\d{1,2}):(\d{2})$/.exec((hora ?? '').trim());
    if (!m) return null;
    const d = new Date();
    d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    return d;
  }

  // Date → "08:00" (lo que guarda el backend)
  aTexto(fecha: Date): string {
    return String(fecha.getHours()).padStart(2, '0') + ':' + String(fecha.getMinutes()).padStart(2, '0');
  }

  // Coloca (o mueve) el pin y completa latitud y longitud
  marcarUbicacion(punto: L.LatLng): void {
    if (this.marcador) {
      this.marcador.setLatLng(punto);
    } else {
      this.marcador = L.marker(punto, { icon: this.icono, draggable: true }).addTo(this.mapa);
      // Si arrastra el pin, se vuelve a calcular todo
      this.marcador.on('dragend', () => this.marcarUbicacion(this.marcador!.getLatLng()));
    }

    this.form.patchValue({
      latitud: Number(punto.lat.toFixed(6)),
      longitud: Number(punto.lng.toFixed(6)),
    });
    this.buscarDireccion(punto.lat, punto.lng);
    this.cdr.detectChanges();
  }

  // HUF22 CA04: dirección con Nominatim (API externa) y nombre automático
  buscarDireccion(lat: number, lon: number): void {
    this.direccion = 'Buscando dirección......';
    this.nS.buscarDireccion(lat, lon).subscribe({
      next: data => {
        this.direccion = data.display_name ?? 'Dirección no disponible';

        // Distrito donde se hizo clic (Nominatim lo manda en address)
        const a = data.address ?? {};
        const distrito = a.suburb || a.city_district || a.neighbourhood || a.town || a.city;

        // Solo rellena el nombre si está vacío o si lo había puesto el mapa
        const nombreActual = this.form.get('nombre')?.value ?? '';
        if (distrito && (!nombreActual || nombreActual === this.nombreAutomatico)) {
          this.nombreAutomatico = 'Centro ' + distrito;
          this.form.patchValue({ nombre: this.nombreAutomatico });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.direccion = 'No se encontró la dirección';
        this.cdr.detectChanges();
      },
    });
  }

  registrar(formDir: FormGroupDirective): void {
    // HUF22 CA05: la ubicación debe estar marcada
    if (this.form.get('latitud')?.invalid || this.form.get('longitud')?.invalid) {
      this.notificar('Haz clic en el mapa para marcar la ubicación del centro', 'advertencia');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }
        if (this.form.value.cierre <= this.form.value.apertura) {
      this.notificar('La hora de cierre debe ser mayor que la de apertura', 'advertencia');
      return;
    }

    // Sin idCentro: con IDENTITY, enviar id 0 hace fallar a Hibernate
    const centro = {
      idUsuario: this.form.value.idUsuario,
      nombre: this.form.value.nombre,
      horario: this.aTexto(this.form.value.apertura) + '-' + this.aTexto(this.form.value.cierre),
      latitud: this.form.value.latitud,
      longitud: this.form.value.longitud,
      estado: this.form.value.estado,
    } as CentroAcopioDTOInsert;

    // HUF22 CA06: POST /api/centrosacopio
    this.cS.insert(centro).subscribe({
      next: () => {
        this.notificar('Se registró correctamente!!!', 'exito');
        formDir.resetForm({ estado: true, apertura: this.aFecha('08:00'), cierre: this.aFecha('18:00') });
        this.nombreAutomatico = '';
        this.marcador?.remove();
        this.marcador = null;
        this.direccion = '';
        this.mapa.setView(this.LIMA, 12);
        this.cdr.detectChanges();
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Ocurrió un error al registrar el centro', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}