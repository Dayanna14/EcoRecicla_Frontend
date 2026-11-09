import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-homecomponent',
  imports: [Menucomponent, MatProgressSpinnerModule],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.css',
})
export class Homecomponent {
  cargando = true;
  dispositivo = this.calcularDispositivo();
  private respaldo: any;

  constructor(private cdr: ChangeDetectorRef) {}

  // Según el ancho de la pantalla, se carga SOLO una landing
  calcularDispositivo(): string {
    const ancho = window.innerWidth;
    if (ancho <= 600) return 'celular';
    if (ancho <= 1024) return 'tablet';
    return 'escritorio';
  }

  // Si cambia el tamaño de la ventana (o se gira el celular), cambia la landing
  @HostListener('window:resize')
  alCambiarTamano() {
    const nuevo = this.calcularDispositivo();
    if (nuevo !== this.dispositivo) {
      this.dispositivo = nuevo;
      this.cargando = true;
      this.cdr.detectChanges();
    }
  }

  // Figma avisa cuando el prototipo YA está listo (Embed API)
  @HostListener('window:message', ['$event'])
  alRecibirMensaje(evento: MessageEvent) {
    const esFigma = evento.origin === 'https://www.figma.com' || evento.origin === 'https://embed.figma.com';
    if (esFigma && evento.data?.type === 'INITIAL_LOAD') {
      this.mostrarLanding();
    }
  }

  // Plan B: si el aviso de Figma no llega en 15 segundos, se muestra igual
  landingCargada() {
    clearTimeout(this.respaldo);
    this.respaldo = setTimeout(() => this.mostrarLanding(), 15000);
  }

  mostrarLanding() {
    clearTimeout(this.respaldo);
    this.cargando = false;
    this.cdr.detectChanges();
  }
}
