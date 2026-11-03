import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Nominatimservice {
    // API externa de OpenStreetMap: convierte coordenadas en dirección
  private apiURL = 'https://nominatim.openstreetmap.org/reverse';

  constructor(private http: HttpClient) {}

  buscarDireccion(lat: number, lon: number): Observable<any> {
    return this.http.get(this.apiURL, {
      params: { lat, lon, format: 'json', 'accept-language': 'es' },
    });
  }
}
