import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private apiUrl = `${environment.apiUrl}/categories`;

  // Obtém todas as categorias de um perfil específico.
  getCategories(profileId: string): Observable<Category[]> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        const params = new HttpParams().set('profile_id', profileId);

        return this.http.get<{ status: string; data: Category[] }>(this.apiUrl, { headers, params }).pipe(
          map(response => response.data || [])
        );
      })
    );
  }

  // Cria uma nova categoria ou subcategoria.
  createCategory(categoryData: Partial<Category>): Observable<Category> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.post<{ status: string; data: Category }>(this.apiUrl, categoryData, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Atualiza os detalhes de uma categoria (nome, ícone, cor, etc).
  updateCategory(id: string, categoryData: Partial<Category>): Observable<Category> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.patch<{ status: string; data: Category }>(`${this.apiUrl}/${id}`, categoryData, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Remove uma categoria (soft delete).
  deleteCategory(id: string): Observable<boolean> {
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
