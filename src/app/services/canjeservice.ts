import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { CanjeDTOList } from '../models/CanjeDTOList'; // Ajusta la ruta de tus modelos
import { environment } from '../../environments/environment';
import { CanjePorUsuarioDTO } from '../models/CanjePorUsuarioDTO';
import { CanjePorEstadoDTO } from '../models/CanjeporEstadoDTO';


@Injectable({
  providedIn: 'root',
})
export class Canjeservice {
  private url = `${environment.base}/canjes`; 

  private listaCambio = new Subject<CanjeDTOList[]>();

  constructor(private http: HttpClient) {}

  list(): Observable<CanjeDTOList[]> {
    return this.http.get<CanjeDTOList[]>(this.url);
  }

  insert(canje: CanjeDTOList): Observable<any> {
    return this.http.post(this.url, canje);
  }

  listId(id: number): Observable<CanjeDTOList> {
    return this.http.get<CanjeDTOList>(`${this.url}/${id}`);
  }

  update(canje: CanjeDTOList): Observable<any> {
    return this.http.put(this.url, canje);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  setLista(listaNueva: CanjeDTOList[]) {
    this.listaCambio.next(listaNueva);
  }

  getLista(data: CanjeDTOList[]): Observable<CanjeDTOList[]> {
    return this.listaCambio.asObservable();
  }

  obtenerCantidadCanjesPorUsuario(): Observable<CanjePorUsuarioDTO[]> {
  return this.http.get<CanjePorUsuarioDTO[]>(`${this.url}/reporte-usuario`);}

  obtenerCantidadCanjesPorEstado(): Observable<CanjePorEstadoDTO[]> {
    return this.http.get<CanjePorEstadoDTO[]>(`${this.url}/reporte-estado`);
  }
}

