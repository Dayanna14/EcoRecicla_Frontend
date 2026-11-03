import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { CentroAcopioDTOInsert } from '../../../models/CentroAcopioDTOInsert';
import { forkJoin, of, switchMap } from 'rxjs';
import * as L from 'leaflet';
import { Nominatimservice } from '../../../services/nominatimservice';
import { DecimalPipe } from '@angular/common';

// Cada fila de la lista: el centro, su marcador y la distancia al usuario
interface ItemCentro {
  centro: CentroAcopioDTOInsert;
  marcador: L.Marker;
  distanciaKm: number | null;
}

@Component({
  selector: 'app-mapacentroscomponent',
  imports: [MatIconModule, MatSnackBarModule, DecimalPipe],
  templateUrl: './mapacentroscomponent.html',
  styleUrl: './mapacentroscomponent.css',
})
export class Mapacentroscomponent implements AfterViewInit, OnDestroy {
  private mapa!: L.Map;
  totalActivos: number = 0;
  totalInactivos: number = 0;

  centrosLista: ItemCentro[] = [];
  tengoUbicacion: boolean = false;
  private miUbicacion: L.LatLng | null = null;

  // Centro de Lima (si no hay permiso de ubicación, el mapa se queda aquí)
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
    this.ubicarUsuario();
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

          this.centrosLista.push({ centro, marcador, distanciaKm: null });
          centro.estado ? this.totalActivos++ : this.totalInactivos++;
        });

        if (puntos.length === 0) {
          this.notificar('No hay centros de acopio para mostrar en el mapa', 'advertencia');
        } else if (!this.miUbicacion) {
          // Sin ubicación del usuario: se acerca para ver todos los centros
          this.mapa.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 15 });
        }

        this.calcularDistancias();
      },
      error: err => {
        console.error('Error al cargar los centros', err);
        this.notificar('Error al cargar los centros de acopio', 'error');
      },
    });
  }

  // HUF26 CA03 y CA04: ubicación del reciclador (Geolocation API del navegador)
  ubicarUsuario(): void {
    if (!navigator.geolocation) {
      this.notificar('Tu navegador no permite obtener la ubicación. Se muestra Lima.', 'advertencia');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        this.miUbicacion = L.latLng(pos.coords.latitude, pos.coords.longitude);
        this.tengoUbicacion = true;

        // Círculo con el margen de error que informa el navegador (en metros)
        L.circle(this.miUbicacion, {
          radius: pos.coords.accuracy,
          color: '#c9893e',
          weight: 1,
          fillColor: '#c9893e',
          fillOpacity: 0.1,
        }).addTo(this.mapa)
          .bindPopup('<div class="popup-centro"><strong>Tú estás aquí</strong></div>');

        this.mapa.setView(this.miUbicacion, 14);
        this.calcularDistancias();
        this.notificar('Ubicación encontrada. Centros ordenados por distancia.', 'exito');
      },
      err => {
        console.log('Error de ubicación', err.code, err.message);
        // 1 = permiso denegado, 2 = ubicación no disponible, 3 = tiempo agotado
        const mensajes: Record<number, string> = {
          1: 'No diste permiso de ubicación. Se muestra el mapa de Lima.',
          2: 'No se pudo obtener tu ubicación (revisa la ubicación de Windows). Se muestra Lima.',
          3: 'La ubicación tardó demasiado. Se muestra el mapa de Lima.',
        };
        this.notificar(mensajes[err.code] ?? 'No se pudo obtener tu ubicación. Se muestra Lima.', 'advertencia');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  }
  // HUF26 CA05: distancia de cada centro y orden del más cercano al más lejano
  calcularDistancias(): void {
    this.centrosLista.forEach(item => {
      item.distanciaKm = this.miUbicacion
        ? this.miUbicacion.distanceTo([item.centro.latitud, item.centro.longitud]) / 1000
        : null;
    });

    this.centrosLista.sort((a, b) =>
      (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity) ||
      a.centro.nombre.localeCompare(b.centro.nombre)
    );
    this.cdr.detectChanges();
  }

  // Al hacer clic en la lista: el mapa va al centro y abre su popup
  verEnMapa(item: ItemCentro): void {
    this.mapa.setView(item.marcador.getLatLng(), 16);
    item.marcador.openPopup();
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