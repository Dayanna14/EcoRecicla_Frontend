import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clasificadorservice, Prediccion } from '../../../services/clasificadorservice';
import { Materialservice } from '../../../services/materialservice';
import { MaterialDTOList } from '../../../models/MaterialDTOList';

@Component({
  selector: 'app-materialclasificarcomponent',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  templateUrl: './materialclasificarcomponent.html',
  styleUrl: './materialclasificarcomponent.css',
})
export class Materialclasificarcomponent implements OnInit {
  @ViewChild('foto') foto!: ElementRef<HTMLImageElement>;

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
      next: data => (this.materiales = data),
      error: err => console.log('No se pudieron cargar los materiales', err),
    });
  }

  get mejor(): Prediccion | null {
    return this.predicciones[0] ?? null;
  }

  // Material del backend que corresponde a la clase sugerida (por nombre)
  get materialSugerido(): MaterialDTOList | null {
    if (!this.mejor) return null;
    const clase = this.normalizar(this.mejor.clase);
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
    } catch (err) {
      console.error('Error al clasificar', err);
      this.notificar('No se pudo clasificar la imagen', 'error');
    } finally {
      this.clasificando = false;
      this.cdr.detectChanges();
    }
  }

  limpiar(input: HTMLInputElement): void {
    if (this.urlFoto) URL.revokeObjectURL(this.urlFoto);
    this.urlFoto = null;
    this.predicciones = [];
    input.value = '';
  }

  // Quita tildes y mayúsculas para comparar "Plástico" con "plastico PET"
  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
