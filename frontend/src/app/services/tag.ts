import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { Tag } from '../models/tag';

@Injectable({ providedIn: 'root' })
export class TagService {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private apiUrl = `${environment.apiUrl}/tags`;

  // Obtém todas as tags associadas a um perfil.
  getTags(profileId: string): Observable<Tag[]> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        const params = new HttpParams().set('profile_id', profileId);

        return this.http.get<{ status: string; data: Tag[] }>(this.apiUrl, { headers, params }).pipe(
          map(response => response.data || [])
        );
      })
    );
  }

  // Cria uma nova tag para o perfil ativo.
  createTag(tagData: Partial<Tag>): Observable<Tag> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.post<{ status: string; data: Tag }>(this.apiUrl, tagData, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Atualiza o nome ou a cor de uma tag existente.
  updateTag(id: string, tagData: Partial<Tag>): Observable<Tag> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.patch<{ status: string; data: Tag }>(`${this.apiUrl}/${id}`, tagData, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Remove uma tag (Soft Delete no backend).
  deleteTag(id: string): Observable<boolean> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.delete<{ status: string; message: string }>(`${this.apiUrl}/${id}`, { headers }).pipe(
          map(response => response.status === 'success')
        );
      })
    );
  }
}
