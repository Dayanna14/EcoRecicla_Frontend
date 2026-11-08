import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EntregaDTOList } from '../models/EntregaDTOList';
import { EntregaDTOInsert } from '../models/EntregaDTOInsert';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Entregaservice {
  private apiURL = `${environment.base}/api/entregas`;

  constructor(private http: HttpClient) {}

  list(): Observable<EntregaDTOList[]> {
    return this.http.get<EntregaDTOList[]>(this.apiURL);
  }

  insert(entrega: EntregaDTOInsert): Observable<EntregaDTOInsert> {
    return this.http.post<EntregaDTOInsert>(this.apiURL, entrega);
  }

  listId(id: number): Observable<EntregaDTOList> {
    return this.http.get<EntregaDTOList>(`${this.apiURL}/${id}`);
  }

  update(entrega: EntregaDTOInsert): Observable<EntregaDTOInsert> {
    return this.http.put<EntregaDTOInsert>(this.apiURL, entrega);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  // Métodos adicionales basados en los endpoints específicos de tu Controller de Spring Boot:

  buscarPorFecha(fecha: string): Observable<any[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<any[]>(`${this.apiURL}/buscar/fecha`, { params });
  }

  obtenerReporteDetallado(idUsuario?: number, idMaterial?: number): Observable<any[]> {
    let params = new HttpParams();
    if (idUsuario) params = params.set('idUsuario', idUsuario);
    if (idMaterial) params = params.set('idMaterial', idMaterial);
    return this.http.get<any[]>(`${this.apiURL}/reportedetallado/UsuarioMaterial`, { params });
  }

  contarMasDe100Puntos(): Observable<number> {
    return this.http.get<number>(`${this.apiURL}/contar/masde100puntos`);
  }
}