export class EntregaPorFechaDTO {
  idEntrega: number = 0;
  fecha: Date = new Date();
  nombreCentro: string = '';
  nombreMaterial: string = '';
  cantidadKg: number = 0;
  puntosGenerados: number = 0;
}