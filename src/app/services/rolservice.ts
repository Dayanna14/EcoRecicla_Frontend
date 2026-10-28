import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RolDTOList } from '../models/RolDTOList';
import { Observable } from 'rxjs';
import { RolDTOInsert } from '../models/RolDTOInsert';

@Injectable({
  providedIn: 'root',
})
export class Rolservice {
    private apiURL = `${environment.base}/api/roles`;

  constructor(private http: HttpClient) {}

  list(): Observable<RolDTOList[]> {
    return this.http.get<RolDTOList[]>(this.apiURL);
  }

  insert(rol: RolDTOInsert): Observable<RolDTOInsert> {
    return this.http.post<RolDTOInsert>(this.apiURL, rol);
  }

  listId(id: number): Observable<RolDTOInsert> {
    return this.http.get<RolDTOInsert>(`${this.apiURL}/${id}`);
  }

  update(rol: RolDTOInsert): Observable<RolDTOInsert> {
    return this.http.put<RolDTOInsert>(this.apiURL, rol);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  searchByName(nombre: string): Observable<RolDTOList[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<RolDTOList[]>(`${this.apiURL}/buscar`, { params });
  }
}
