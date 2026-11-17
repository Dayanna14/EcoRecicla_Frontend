import { Injectable } from '@angular/core';
// Se importan solo las piezas necesarias de TensorFlow.js (ya vienen con @tensorflow/tfjs).
// El paquete completo '@tensorflow/tfjs' incluye tfjs-data, que usa módulos de Node
// y rompe la compilación de Angular.
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { LayersModel, loadLayersModel } from '@tensorflow/tfjs-layers';

// Resultado de clasificar una foto
export interface Prediccion {
  clase: string;
  confianza: number; // 0 a 100
}

/**
 * Clasificador de materiales con IA (HUF20).
 * Usa el modelo exportado desde Teachable Machine (TensorFlow.js),
 * guardado en public/modelo/ (model.json, weights.bin y metadata.json).
 * Todo corre en el navegador: no hay servidor de IA ni costo por uso.
 */
@Injectable({
  providedIn: 'root',
})
export class Clasificadorservice {
  private readonly RUTA_MODELO = 'modelo/model.json';
  private readonly RUTA_METADATA = 'modelo/metadata.json';
  private readonly TAMANO = 224; // Teachable Machine entrena con imágenes de 224x224

  private modelo: LayersModel | null = null;
  private clases: string[] = [];
  private cargando: Promise<void> | null = null;

  // Carga el modelo una sola vez y lo reutiliza
  cargarModelo(): Promise<void> {
    if (this.modelo) {
      return Promise.resolve();
    }
    if (!this.cargando) {
      this.cargando = (async () => {
        // El orden de las clases viene de metadata.json (el mismo de Teachable Machine)
        const respuesta = await fetch(this.RUTA_METADATA);
        if (!respuesta.ok) {
          throw new Error('No se encontró public/modelo/metadata.json');
        }
        const metadata = await respuesta.json();
        this.clases = metadata.labels ?? [];
        this.modelo = await loadLayersModel(this.RUTA_MODELO);
      })().catch(err => {
        this.cargando = null; // permite reintentar
        throw err;
      });
    }
    return this.cargando;
  }

  // Devuelve todas las clases ordenadas de mayor a menor confianza
  async clasificar(imagen: HTMLImageElement): Promise<Prediccion[]> {
    await this.cargarModelo();

    const probabilidades = tf.tidy(() => {
      const pixeles = tf.cast(tf.browser.fromPixels(this.recortarCuadrado(imagen)), 'float32');
      // Normaliza de [0, 255] a [-1, 1], igual que Teachable Machine
      const normalizado = tf.sub(tf.div(pixeles, 127.5), 1);
      const tensor = tf.expandDims(normalizado, 0);
      return (this.modelo!.predict(tensor) as tf.Tensor).dataSync();
    });

    return Array.from(probabilidades)
      .map((p, i) => ({
        clase: this.clases[i] ?? `Clase ${i + 1}`,
        confianza: Math.round(p * 100),
      }))
      .sort((a, b) => b.confianza - a.confianza);
  }

  // Recorta el centro de la foto en un cuadrado de 224x224 (como Teachable Machine)
  private recortarCuadrado(imagen: HTMLImageElement): HTMLCanvasElement {
    const lado = Math.min(imagen.naturalWidth, imagen.naturalHeight);
    const x = (imagen.naturalWidth - lado) / 2;
    const y = (imagen.naturalHeight - lado) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = this.TAMANO;
    canvas.height = this.TAMANO;
    canvas.getContext('2d')!.drawImage(imagen, x, y, lado, lado, 0, 0, this.TAMANO, this.TAMANO);
    return canvas;
  }
}
