import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ImpactoDTO } from '../models/ImpactoDTO';
import { CentroPublicoDTO } from '../models/CentroPublicoDTO';
import { RecompensaDTOList } from '../models/RecompensaDTOList';

// Datos públicos para la página de inicio (no necesitan iniciar sesión)
@Injectable({
  providedIn: 'root',
})
export class Publicoservice {
  private url = `${environment.base}/api/publico`;

  constructor(private http: HttpClient) {}

  impacto(): Observable<ImpactoDTO> {
    return this.http.get<ImpactoDTO>(`${this.url}/impacto`);
  }

  centros(): Observable<CentroPublicoDTO[]> {
    return this.http.get<CentroPublicoDTO[]>(`${this.url}/centros`);
  }

  recompensas(): Observable<RecompensaDTOList[]> {
    return this.http.get<RecompensaDTOList[]>(`${this.url}/recompensas`);
  }
}
