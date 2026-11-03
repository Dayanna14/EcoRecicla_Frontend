import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuariosDTOList } from '../models/UsuariosDTOList';
import { UsuariosDTOInsert } from '../models/UsuariosDTOInsert';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
    private apiURL = `${environment.base}/api/usuarios`;

  constructor(private http: HttpClient) {}

  list(): Observable<UsuariosDTOList[]> {
    return this.http.get<UsuariosDTOList[]>(this.apiURL);
  }

  insert(usuario: UsuariosDTOInsert): Observable<UsuariosDTOInsert> {
    return this.http.post<UsuariosDTOInsert>(this.apiURL, usuario);
  }
}