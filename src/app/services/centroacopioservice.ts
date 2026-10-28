import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CentroAcopioDTOList } from '../models/CentroAcopioDTOList';
import { Observable } from 'rxjs';
import { CentroAcopioDTOInsert } from '../models/CentroAcopioDTOInsert';

@Injectable({
  providedIn: 'root',
})
export class Centroacopioservice {
    private apiURL = `${environment.base}/api/centrosacopio`;

  constructor(private http: HttpClient) {}

  list(): Observable<CentroAcopioDTOList[]> {
    return this.http.get<CentroAcopioDTOList[]>(this.apiURL);
  }

  insert(centro: CentroAcopioDTOInsert): Observable<CentroAcopioDTOInsert> {
    return this.http.post<CentroAcopioDTOInsert>(this.apiURL, centro);
  }

  listId(id: number): Observable<CentroAcopioDTOInsert> {
    return this.http.get<CentroAcopioDTOInsert>(`${this.apiURL}/${id}`);
  }

  update(centro: CentroAcopioDTOInsert): Observable<CentroAcopioDTOInsert> {
    return this.http.put<CentroAcopioDTOInsert>(this.apiURL, centro);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  searchByEstado(estado: boolean): Observable<CentroAcopioDTOList[]> {
    const params = new HttpParams().set('estado', estado);
    return this.http.get<CentroAcopioDTOList[]>(`${this.apiURL}/buscar`, { params });
  }
}
