import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { CentroAcopioDTOInsert } from '../../../models/CentroAcopioDTOInsert';
import * as L from 'leaflet';
import { Nominatimservice } from '../../../services/nominatimservice';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-centroacopioupdatecomponent',
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
  templateUrl: './centroacopioupdatecomponent.html',
  styleUrl: './centroacopioupdatecomponent.css',
  providers: [provideNativeDateAdapter()],
})
export class Centroacopioupdatecomponent {
   idCentro: number = 0;
  idUsuario: number = 0; // se conserva el usuario que ya tiene el centro
  formCentro!: FormGroup;
  direccion: string = '';

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
    private cS: Centroacopioservice,
    private nS: Nominatimservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 1. Recuperar el ID desde la URL (/centrosacopio/editar/:id)
    this.idCentro = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Crear el formulario
    this.formCentro = this.fb.group({
      codigo: [this.idCentro],
      nombre: ['', Validators.required],
      apertura: [null, Validators.required],
      cierre: [null, Validators.required],
      latitud: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitud: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      estado: [true, Validators.required],
    });

    if (!this.idCentro || isNaN(this.idCentro)) {
      this.notificar('ID de centro inválido', 'error');
      return;
    }

    // 3. Cargar los datos actuales
    this.buscarPorId();
  }

  // El mapa se crea cuando el <div id="mapaEditar"> ya existe
  ngAfterViewInit(): void {
    this.mapa = L.map('mapaEditar').setView(this.LIMA, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.mapa);

    // Clic en el mapa = nueva ubicación
    this.mapa.on('click', (e: L.LeafletMouseEvent) => this.moverUbicacion(e.latlng));

    // Si los datos llegaron antes que el mapa, se pone el pin ahora
    this.ponerMarcadorActual();
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

  buscarPorId(): void {
    this.cS.listId(this.idCentro).subscribe({
      next: (data: CentroAcopioDTOInsert) => {
        this.idUsuario = data.idUsuario;
        this.formCentro.patchValue({
          codigo: data.idCentro,
          nombre: data.nombre,
          apertura: this.aFecha((data.horario ?? '').split('-')[0]),
          cierre: this.aFecha((data.horario ?? '').split('-')[1]),
          latitud: data.latitud,
          longitud: data.longitud,
          estado: data.estado,
        });
        this.ponerMarcadorActual();
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificar('No se encontró el centro de acopio', 'error');
      },
    });
  }

  // HUF24 CA06: el marcador aparece en la ubicación actual del centro
  ponerMarcadorActual(): void {
    const lat = this.formCentro?.value.latitud;
    const lng = this.formCentro?.value.longitud;
    if (!this.mapa || lat == null || lng == null) return;

    const punto = L.latLng(lat, lng);
    if (!this.marcador) {
      this.marcador = L.marker(punto, { icon: this.icono, draggable: true }).addTo(this.mapa);
      // HUF24 CA06: el marcador se puede mover arrastrándolo
      this.marcador.on('dragend', () => this.moverUbicacion(this.marcador!.getLatLng()));
    } else {
      this.marcador.setLatLng(punto);
    }
    this.mapa.setView(punto, 16);
    this.buscarDireccion(lat, lng);
  }

  // Mueve el pin y actualiza latitud y longitud
  moverUbicacion(punto: L.LatLng): void {
    this.marcador?.setLatLng(punto);
    this.formCentro.patchValue({
      latitud: Number(punto.lat.toFixed(6)),
      longitud: Number(punto.lng.toFixed(6)),
    });
    this.buscarDireccion(punto.lat, punto.lng);
    this.cdr.detectChanges();
  }

  // Dirección con Nominatim (API externa)
  buscarDireccion(lat: number, lon: number): void {
    this.direccion = 'Buscando dirección......';
    this.nS.buscarDireccion(lat, lon).subscribe({
      next: data => {
        this.direccion = data.display_name ?? 'Dirección no disponible';
        this.cdr.detectChanges();
      },
      error: () => {
        this.direccion = 'No se encontró la dirección';
        this.cdr.detectChanges();
      },
    });
  }

  actualizarCentro(): void {
    if (this.formCentro.invalid) {
      this.formCentro.markAllAsTouched();
      this.notificar('Los campos son obligatorios!!', 'advertencia');
      return;
    }
    
    if (this.formCentro.value.cierre <= this.formCentro.value.apertura) {
      this.notificar('La hora de cierre debe ser mayor que la de apertura', 'advertencia');
      return;
    }

    const dto: CentroAcopioDTOInsert = {
      idCentro: this.formCentro.value.codigo,
      idUsuario: this.idUsuario,
      nombre: this.formCentro.value.nombre,
      horario: this.aTexto(this.formCentro.value.apertura) + '-' + this.aTexto(this.formCentro.value.cierre),
      latitud: this.formCentro.value.latitud,
      longitud: this.formCentro.value.longitud,
      estado: this.formCentro.value.estado,
    };

    this.cS.update(dto).subscribe({
      next: () => {
        this.notificar('Centro de acopio actualizado correctamente', 'exito');
        this.router.navigate(['/centrosacopio/listar']);
      },
      error: err => {
        this.notificar(err.error?.message ?? 'Error al actualizar el centro de acopio', 'error');
        this.cdr.detectChanges();
      },
    });
  }
}
