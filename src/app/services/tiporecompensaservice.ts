import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TipoRecompensaDTOInsert } from '../models/TipoRecompensaDTOInsert';
import { TipoRecompensaDTOList } from '../models/TipoRecompensaDTOList';
import { TipoRecompensaRankingDTO } from '../models/TipoRecompensaRankingDTO';

@Injectable({
  providedIn: 'root',
})
export class Tiporecompensaservice {
  private apiURL = `${environment.base}/api/tiporecompensas`;

  constructor(private http: HttpClient) {}

  list(): Observable<TipoRecompensaDTOList[]> {
    return this.http.get<TipoRecompensaDTOList[]>(this.apiURL);
  }

  insert(tipo: TipoRecompensaDTOInsert): Observable<TipoRecompensaDTOInsert> {
    return this.http.post<TipoRecompensaDTOInsert>(this.apiURL, tipo);
  }

  listId(id: number): Observable<TipoRecompensaDTOList> {
    return this.http.get<TipoRecompensaDTOList>(`${this.apiURL}/${id}`);
  }

  // El backend recibe el id en la URL: PUT /api/tiporecompensas/{id}
  update(id: number, tipo: TipoRecompensaDTOInsert): Observable<TipoRecompensaDTOList> {
    return this.http.put<TipoRecompensaDTOList>(`${this.apiURL}/${id}`, tipo);
  }

  // El backend responde con un texto, no con JSON
  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiURL}/${id}`, { responseType: 'text' });
  }

  searchByName(nombre: string): Observable<TipoRecompensaDTOList[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<TipoRecompensaDTOList[]>(`${this.apiURL}/buscar`, { params });
  }

  // Reporte: tipos de recompensa más canjeados (HUF17)
  ranking(): Observable<TipoRecompensaRankingDTO[]> {
    return this.http.get<TipoRecompensaRankingDTO[]>(`${this.apiURL}/ranking`);
  }
}
