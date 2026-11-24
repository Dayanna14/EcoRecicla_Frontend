import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilDTO } from '../models/PerfilDTO';
import { CambiarContraseniaDTO } from '../models/CambiarContraseniaDTO';

// "Mi perfil": el backend identifica al usuario por el token
@Injectable({
  providedIn: 'root',
})
export class Perfilservice {
  private url = `${environment.base}/api/perfil`;

  constructor(private http: HttpClient) {}

  obtener(): Observable<PerfilDTO> {
    return this.http.get<PerfilDTO>(this.url);
  }

  cambiarContrasenia(dto: CambiarContraseniaDTO): Observable<PerfilDTO> {
    return this.http.put<PerfilDTO>(`${this.url}/contrasenia`, dto);
  }
}
