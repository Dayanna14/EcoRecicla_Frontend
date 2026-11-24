import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ContraseniaTemporalDTO } from '../models/ContraseniaTemporalDTO';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuariosDTOList } from '../models/UsuariosDTOList';
import { UsuariosDTOInsert } from '../models/UsuariosDTOInsert';
import { UsuarioPorEstadoDTO } from '../models/UsuarioPorEstadoDTO';

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

  listId(id: number): Observable<UsuariosDTOList> {
    return this.http.get<UsuariosDTOList>(`${this.apiURL}/${id}`);
  }

  update(usuario: UsuariosDTOInsert): Observable<UsuariosDTOInsert> {
    return this.http.put<UsuariosDTOInsert>(this.apiURL, usuario);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  porEstado(): Observable<UsuarioPorEstadoDTO[]> {
    return this.http.get<UsuarioPorEstadoDTO[]>(`${this.apiURL}/usuarios-por-estado`);
  }

  // Habilitar o inhabilitar una cuenta
  cambiarEstado(id: number): Observable<UsuariosDTOList> {
    return this.http.put<UsuariosDTOList>(`${this.apiURL}/${id}/estado`, {});
  }

  // Opción B de "olvidé mi contraseña": el admin genera una contraseña temporal
  restablecerContrasenia(id: number): Observable<ContraseniaTemporalDTO> {
    return this.http.put<ContraseniaTemporalDTO>(`${this.apiURL}/${id}/restablecer`, {});
  }
}
