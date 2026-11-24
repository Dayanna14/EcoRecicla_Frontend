import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import * as L from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clasificadorservice, Prediccion } from '../../../services/clasificadorservice';
import { Materialservice } from '../../../services/materialservice';
import { MaterialDTOList } from '../../../models/MaterialDTOList';
import { RecompensaDTOList } from '../../../models/RecompensaDTOList';
import { RecompensaService } from '../../../services/recompensaservice';
import { Centroacopioservice } from '../../../services/centroacopioservice';

// Consejos para preparar cada material antes de llevarlo (por nombre de clase del modelo)
const CONSEJOS: { [clase: string]: { icono: string; texto: string }[] } = {
  plastico: [
    { icono: 'water_drop', texto: 'Enjuágalo para quitar restos de comida o bebida.' },
    { icono: 'compress', texto: 'Aplástalo para que ocupe menos espacio.' },
    { icono: 'block', texto: 'Separa la tapa: muchas veces es de otro tipo de plástico.' },
  ],
  papel: [
    { icono: 'wb_sunny', texto: 'Debe estar seco y limpio: el papel con grasa o mojado no se recicla.' },
    { icono: 'layers', texto: 'Dóblalo o aplánalo; quita grapas y cintas si puedes.' },
  ],
  vidrio: [
    { icono: 'water_drop', texto: 'Enjuágalo y quítale la tapa.' },
    { icono: 'warning', texto: 'Si está roto, envuélvelo en papel para que nadie se corte.' },
    { icono: 'block', texto: 'No mezcles espejos, focos ni vasos de vidrio templado.' },
  ],
  // Clase nueva del modelo v3 (latas y envases metálicos)
  metal: [
    { icono: 'water_drop', texto: 'Enjuaga las latas para quitar restos de comida o bebida.' },
    { icono: 'compress', texto: 'Aplástalas para que ocupen menos espacio.' },
    { icono: 'warning', texto: 'Cuidado con los bordes filosos de las latas abiertas.' },
  ],
};

@Component({
  selector: 'app-materialclasificarcomponent',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  templateUrl: './materialclasificarcomponent.html',
  styleUrl: './materialclasificarcomponent.css',
})
export class Materialclasificarcomponent implements OnInit, OnDestroy {
  // Etiqueta con la versión del modelo (se muestra junto al % de confianza)
  get versionModelo(): string {
    return this.cS.VERSION_MODELO;
  }

  @ViewChild('foto') foto!: ElementRef<HTMLImageElement>;
  @ViewChild('video') video?: ElementRef<HTMLVideoElement>;

  // Cámara en vivo
  camaraActiva: boolean = false;
  private stream: MediaStream | null = null;
  private intervalo: any = null;

  // El usuario puede corregir a la IA cuando no está segura
  claseElegida: string | null = null;

  // Calculadora
  kg: number = 1;
  recompensas: RecompensaDTOList[] = [];

  // ¿Dónde lo llevo?
  centrosCercanos: { nombre: string; km: number | null; horario: string; lat: number; lng: number }[] = [];
  buscandoCentros: boolean = false;
  sinUbicacion: boolean = false;
  private miLat: number | null = null;
  private miLng: number | null = null;
  private mapaIA: L.Map | null = null;

  // Promedio de las últimas lecturas de la cámara: el resultado no salta de un material a otro
  private historial: Prediccion[][] = [];
  private readonly LECTURAS = 6;

  // Por debajo de este porcentaje, se pide al usuario que confirme
  readonly CONFIANZA_MINIMA = 60;

  cargandoModelo: boolean = true;
  modeloDisponible: boolean = false;
  clasificando: boolean = false;

  urlFoto: string | null = null;
  predicciones: Prediccion[] = [];
  materiales: MaterialDTOList[] = [];

  constructor(
    private cS: Clasificadorservice,
    private mS: Materialservice,
    private rS: RecompensaService,
    private caS: Centroacopioservice,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 1. Cargar el modelo una sola vez (puede tardar la primera vez)
    this.cS.cargarModelo()
      .then(() => (this.modeloDisponible = true))
      .catch(err => {
        console.error('Error al cargar el modelo de IA', err);
        this.notificar('No se pudo cargar el modelo de IA', 'error');
      })
      .finally(() => {
        this.cargandoModelo = false;
        this.cdr.detectChanges();
      });

    // 2. Traer los materiales del backend para mostrar sus puntos
    this.mS.list().subscribe({
      next: data => { this.materiales = data; this.cdr.detectChanges(); },
      error: err => console.log('No se pudieron cargar los materiales', err),
    });
    this.rS.list().subscribe({
      next: data => { this.recompensas = data.filter(r => r.estado).sort((a, b) => a.costoPuntos - b.costoPuntos); this.cdr.detectChanges(); },
    });
  }

  ngOnDestroy(): void {
    this.detenerCamara();
    this.mapaIA?.remove();
  }

  // ===== Cámara en vivo (⚠️ NO ENSEÑADO EN CLASE: getUserMedia) =====
  async iniciarCamara(): Promise<void> {
    try {
      this.limpiarFoto();
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      this.camaraActiva = true;
      this.cdr.detectChanges();
      const v = this.video!.nativeElement;
      v.srcObject = this.stream;
      await v.play();
      // Clasifica lo que ve la cámara cada medio segundo
      this.intervalo = setInterval(() => this.clasificarVideo(), 500);
    } catch (err) {
      console.error('No se pudo abrir la cámara', err);
      this.notificar('No se pudo abrir la cámara. Revisa el permiso del navegador.', 'advertencia');
      this.detenerCamara();
    }
  }

  detenerCamara(): void {
    this.historial = [];
    if (this.intervalo) clearInterval(this.intervalo);
    this.intervalo = null;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.camaraActiva = false;
    this.cdr.detectChanges();
  }

  // Congela el resultado actual y apaga la cámara
  capturar(): void {
    this.detenerCamara();
    this.buscarCentros();
  }

  private async clasificarVideo(): Promise<void> {
    const v = this.video?.nativeElement;
    if (!v || v.readyState < 2 || this.clasificando) return;
    this.clasificando = true;
    try {
      const lectura = await this.cS.clasificar(v);
      this.historial = [...this.historial, lectura].slice(-this.LECTURAS);
      this.predicciones = this.promediar(this.historial);
      this.claseElegida = null;
    } finally {
      this.clasificando = false;
      this.cdr.detectChanges();
    }
  }

  private promediar(lecturas: Prediccion[][]): Prediccion[] {
    const suma = new Map<string, number>();
    lecturas.forEach(l => l.forEach(p => suma.set(p.clase, (suma.get(p.clase) ?? 0) + p.confianza)));
    return [...suma.entries()]
      .map(([clase, total]) => ({ clase, confianza: Math.round(total / lecturas.length) }))
      .sort((a, b) => b.confianza - a.confianza);
  }

  // ===== Resultado =====
  // Clase final: la que eligió el usuario o la de mayor confianza
  get claseFinal(): string | null {
    return this.claseElegida ?? this.mejor?.clase ?? null;
  }

  get noDetectaMaterial(): boolean {
    return this.normalizar(this.claseFinal ?? '') === 'nada';
  }

  get dudosa(): boolean {
    return !!this.mejor && !this.claseElegida && this.mejor.confianza < this.CONFIANZA_MINIMA;
  }

  elegir(clase: string): void {
    this.claseElegida = clase;
    this.buscarCentros();
  }

  get consejos(): { icono: string; texto: string }[] {
    return CONSEJOS[this.normalizar(this.claseFinal ?? '')] ?? [];
  }

  // ===== Calculadora =====
  cambiarKg(valor: string): void {
    const n = Number(valor);
    this.kg = n > 0 ? n : 0;
  }

  get puntosEstimados(): number {
    return this.materialSugerido ? Math.round(this.kg * this.materialSugerido.puntosPorKg) : 0;
  }

  get co2Estimado(): number {
    return this.materialSugerido ? Math.round(this.kg * this.materialSugerido.factorCo2 * 10) / 10 : 0;
  }

  // Recompensa más cara que alcanza con estos puntos, o la siguiente por alcanzar
  get recompensaAlcanzable(): RecompensaDTOList | null {
    const alcanza = this.recompensas.filter(r => r.costoPuntos <= this.puntosEstimados);
    return alcanza.length > 0 ? alcanza[alcanza.length - 1] : null;
  }

  get siguienteRecompensa(): RecompensaDTOList | null {
    return this.recompensas.find(r => r.costoPuntos > this.puntosEstimados) ?? null;
  }

  // ===== ¿Dónde lo llevo? =====
  buscarCentros(): void {
    if (this.buscandoCentros || this.centrosCercanos.length > 0) return;
    this.buscandoCentros = true;
    // La lista no trae coordenadas: se pide cada centro por id (igual que el mapa)
    this.caS.list().pipe(
      switchMap(centros => {
        const activos = centros.filter(c => c.estado);
        return activos.length > 0 ? forkJoin(activos.map(c => this.caS.listId(c.idCentro))) : of([]);
      })
    ).subscribe({
      next: (centros: any[]) => {
        const conCoordenadas = centros.filter(c => c.latitud != null && c.longitud != null);
        const ordenar = (lat: number | null, lng: number | null) => {
          this.miLat = lat;
          this.miLng = lng;
          this.centrosCercanos = conCoordenadas
            .map(c => ({
              nombre: c.nombre, horario: c.horario ?? '', lat: c.latitud, lng: c.longitud,
              km: lat === null || lng === null ? null : this.distanciaKm(lat, lng, c.latitud, c.longitud),
            }))
            .sort((a, b) => (a.km ?? 0) - (b.km ?? 0))
            .slice(0, 3);
          this.buscandoCentros = false;
          this.cdr.detectChanges();
          setTimeout(() => this.dibujarMapa()); // el div del mapa ya existe
        };
        if (!navigator.geolocation) {
          this.sinUbicacion = true;
          ordenar(null, null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          pos => ordenar(pos.coords.latitude, pos.coords.longitude),
          () => { this.sinUbicacion = true; ordenar(null, null); },
          { timeout: 8000 },
        );
      },
      error: () => { this.buscandoCentros = false; this.cdr.detectChanges(); },
    });
  }

  // Distancia en línea recta entre dos puntos (fórmula de Haversine)
  private distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const rad = (g: number) => (g * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }

  // Ruta en OpenStreetMap (el mismo mapa que usa EcoRecicla)
  rutaMapa(lat: number, lng: number): string {
    const origen = this.miLat !== null && this.miLng !== null ? `${this.miLat}%2C${this.miLng}` : '';
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${origen}%3B${lat}%2C${lng}`;
  }

  // Mini mapa con Leaflet: tu ubicación y los centros más cercanos
  private dibujarMapa(): void {
    const div = document.getElementById('mapa-ia');
    if (!div || this.centrosCercanos.length === 0) return;
    this.mapaIA?.remove();
    this.mapaIA = L.map(div, { zoomControl: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.mapaIA);
    const icono = L.icon({ iconUrl: 'img/mapa/pin-activo.svg', iconSize: [30, 40], iconAnchor: [15, 38] });
    const puntos: L.LatLngTuple[] = [];
    this.centrosCercanos.forEach(c => {
      L.marker([c.lat, c.lng], { icon: icono }).addTo(this.mapaIA!).bindTooltip(c.nombre);
      puntos.push([c.lat, c.lng]);
    });
    if (this.miLat !== null && this.miLng !== null) {
      L.circleMarker([this.miLat, this.miLng], { radius: 8, color: '#2d5d3e', fillColor: '#709645', fillOpacity: 1 })
        .addTo(this.mapaIA).bindTooltip('Tú');
      puntos.push([this.miLat, this.miLng]);
    }
    this.mapaIA.fitBounds(L.latLngBounds(puntos), { padding: [30, 30], maxZoom: 15 });
  }

  get mejor(): Prediccion | null {
    return this.predicciones[0] ?? null;
  }

  // Material del backend que corresponde a la clase sugerida (por nombre)
  get materialSugerido(): MaterialDTOList | null {
    if (!this.claseFinal) return null;
    const clase = this.normalizar(this.claseFinal);
    return (
      this.materiales.find(m => {
        const nombre = this.normalizar(m.nombre);
        return nombre.includes(clase) || clase.includes(nombre);
      }) ?? null
    );
  }

  notificar(texto: string, tipo: 'exito' | 'advertencia' | 'error'): void {
    this.snackBar.open(texto, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['noti-' + tipo],
    });
  }

  seleccionarFoto(event: Event): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.notificar('El archivo debe ser una imagen (JPG o PNG)', 'advertencia');
      return;
    }

    this.detenerCamara();
    if (this.urlFoto) URL.revokeObjectURL(this.urlFoto);
    this.urlFoto = URL.createObjectURL(archivo);
    this.predicciones = [];
    this.cdr.detectChanges();
  }

  // Se llama cuando la foto terminó de cargarse en el <img>
  async clasificar(): Promise<void> {
    if (!this.modeloDisponible || !this.urlFoto) return;

    this.clasificando = true;
    this.cdr.detectChanges();
    try {
      this.predicciones = await this.cS.clasificar(this.foto.nativeElement);
      this.claseElegida = null;
      this.buscarCentros();
    } catch (err) {
      console.error('Error al clasificar', err);
      this.notificar('No se pudo clasificar la imagen', 'error');
    } finally {
      this.clasificando = false;
      this.cdr.detectChanges();
    }
  }

  limpiar(input: HTMLInputElement): void {
    this.limpiarFoto();
    input.value = '';
  }

  private limpiarFoto(): void {
    if (this.urlFoto) URL.revokeObjectURL(this.urlFoto);
    this.urlFoto = null;
    this.predicciones = [];
    this.claseElegida = null;
  }

  // Quita tildes y mayúsculas para comparar "Plástico" con "plastico PET"
  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
