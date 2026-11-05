import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MaterialDTOInsert } from '../models/MaterialDTOInsert';
import { MaterialDTOList } from '../models/MaterialDTOList';

@Injectable({
  providedIn: 'root',
})
export class Materialservice {
  private apiURL = `${environment.base}/api/material`;

  constructor(private http: HttpClient) {}

  list(): Observable<MaterialDTOList[]> {
    return this.http.get<MaterialDTOList[]>(this.apiURL);
  }

  insert(material: MaterialDTOInsert): Observable<MaterialDTOInsert> {
    return this.http.post<MaterialDTOInsert>(this.apiURL, material);
  }

  listId(id: number): Observable<MaterialDTOList> {
    return this.http.get<MaterialDTOList>(`${this.apiURL}/${id}`);
  }

  // El backend recibe el id en la URL: PUT /api/material/{id}
  update(id: number, material: MaterialDTOInsert): Observable<MaterialDTOInsert> {
    return this.http.put<MaterialDTOInsert>(`${this.apiURL}/${id}`, material);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  searchByName(nombre: string): Observable<MaterialDTOList[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<MaterialDTOList[]>(`${this.apiURL}/buscar`, { params });
  }
}
