import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecompensaDTOList } from '../models/RecompensaDTOList';
import { RecompensaDTOInsert } from '../models/RecompensaDTOInsert';


@Injectable({
  providedIn: 'root',
})
export class RecompensaService {
    private apiURL = `${environment.base}/api/recompensa`;

  constructor(private http: HttpClient) {}

  list(): Observable<RecompensaDTOList[]> {
    return this.http.get<RecompensaDTOList[]>(this.apiURL);
  }

  insert(recompensa: RecompensaDTOInsert): Observable<RecompensaDTOInsert> {
    return this.http.post<RecompensaDTOInsert>(this.apiURL, recompensa);
  }

  listId(id: number): Observable<RecompensaDTOList> {
    return this.http.get<RecompensaDTOList>(`${this.apiURL}/${id}`);
  }

  update(recompensa: RecompensaDTOInsert): Observable<RecompensaDTOInsert> {
    return this.http.put<RecompensaDTOInsert>(this.apiURL, recompensa);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}