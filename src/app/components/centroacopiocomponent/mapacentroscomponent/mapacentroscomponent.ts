import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { CentroAcopioDTOInsert } from '../../../models/CentroAcopioDTOInsert';
import { forkJoin, of, switchMap } from 'rxjs';
import * as L from 'leaflet';
import { Nominatimservice } from '../../../services/nominatimservice';

@Component({
  selector: 'app-mapacentroscomponent',
  imports: [MatIconModule, MatSnackBarModule],
  templateUrl: './mapacentroscomponent.html',
  styleUrl: './mapacentroscomponent.css',
})
export class Mapacentroscomponent implements AfterViewInit, OnDestroy {
   private mapa!: L.Map;
  totalActivos: number = 0;
  totalInactivos: number = 0;

  // Centro de Lima (si no hay centros, el mapa se queda aquí)
  private readonly LIMA: L.LatLngTuple = [-12.0464, -77.0428];

  // Tus SVG como marcadores (public/img/mapa)
  private iconoActivo = L.icon({
    iconUrl: 'img/mapa/pin-activo.svg',
    iconSize: [36, 48],
    iconAnchor: [18, 45],
    popupAnchor: [0, -40],
  });
  private iconoInactivo = L.icon({
    iconUrl: 'img/mapa/pin-inactivo.svg',
    iconSize: [36, 48],
    iconAnchor: [18, 45],
    popupAnchor: [0, -40],
  });

  constructor(
    private cS: Centroacopioservice,
    private nS: Nominatimservice,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  // El mapa se crea cuando el <div id="mapa"> ya existe en la pantalla
  ngAfterViewInit(): void {
    this.crearMapa();
    this.cargarCentros();
  }

  // Al salir de la página se libera el mapa
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

  crearMapa(): void {
    this.mapa = L.map('mapa').setView(this.LIMA, 12);

    // API externa 1: mapas de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.mapa);
  }

  cargarCentros(): void {
    // GET /api/centrosacopio no trae lat/lng → se pide el detalle de cada uno
    this.cS.list().pipe(
      switchMap(centros =>
        centros.length > 0
          ? forkJoin(centros.map(c => this.cS.listId(c.idCentro)))
          : of([])
      )
    ).subscribe({
      next: (data: CentroAcopioDTOInsert[]) => {
        const puntos: L.LatLngTuple[] = [];

        data.forEach(centro => {
          if (centro.latitud == null || centro.longitud == null) return;

          const punto: L.LatLngTuple = [centro.latitud, centro.longitud];
          puntos.push(punto);

          const marcador = L.marker(punto, { icon: centro.estado ? this.iconoActivo : this.iconoInactivo })
            .addTo(this.mapa)
            .bindPopup(this.crearPopup(centro, 'Buscando dirección......'));

          // Al abrir el popup se consulta la API externa
          marcador.on('popupopen', () => this.obtenerDireccion(centro, marcador));

          centro.estado ? this.totalActivos++ : this.totalInactivos++;
        });

        if (puntos.length > 0) {
          // Acerca el mapa para que se vean todos los marcadores
          this.mapa.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 15 });
        } else {
          this.notificar('No hay centros de acopio para mostrar en el mapa', 'advertencia');
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al cargar los centros', err);
        this.notificar('Error al cargar los centros de acopio', 'error');
      },
    });
  }

  // API externa 2: Nominatim (mismo patrón que obtenerPersonaje de la profesora)
  obtenerDireccion(centro: CentroAcopioDTOInsert, marcador: L.Marker): void {
    this.nS.buscarDireccion(centro.latitud, centro.longitud).subscribe({
      next: data => {
        const direccion = data.display_name ?? 'Dirección no disponible';
        marcador.setPopupContent(this.crearPopup(centro, direccion));
      },
      error: err => {
        console.log('Ocurrió un error al buscar la dirección');
        marcador.setPopupContent(this.crearPopup(centro, 'No se encontró la dirección'));
      },
    });
  }

  // Contenido de la ventanita al hacer clic en un marcador
  crearPopup(centro: CentroAcopioDTOInsert, direccion: string): string {
    const estado = centro.estado
      ? '<span class="popup-chip popup-activo">● Activo</span>'
      : '<span class="popup-chip popup-inactivo">● Inactivo</span>';
    const ruta = `https://www.openstreetmap.org/directions?route=%3B${centro.latitud}%2C${centro.longitud}`;

    return `
      <div class="popup-centro">
        <strong>${this.escapar(centro.nombre)}</strong>
        <span class="popup-direccion">📍 ${this.escapar(direccion)}</span>
        <span class="popup-horario">🕒 ${this.escapar(centro.horario)}</span>
        ${estado}
        <a href="${ruta}" target="_blank" rel="noopener">Cómo llegar →</a>
      </div>`;
  }

  // Evita que un nombre con < > rompa el HTML del popup
  private escapar(texto: string): string {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  }
}