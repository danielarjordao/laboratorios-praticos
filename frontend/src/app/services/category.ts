import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import {
  Category,
  CategoryDeleteResponse,
  CategoryListResponse,
  CategoryResponse,
} from '../models/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(Auth);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  // Executa requisicoes reaproveitando token e header de autenticacao.
  private withAuthHeaders<T>(requestFactory: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => requestFactory(this.buildAuthHeaders(token))),
    );
  }

  // Monta o header Authorization quando o token existe.
  private buildAuthHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Retorna categorias associadas a um perfil.
  getCategories(profileId: string): Observable<Category[]> {
    return this.withAuthHeaders(headers => {
      const params = new HttpParams().set('profile_id', profileId);

      return this.http.get<CategoryListResponse>(this.apiUrl, { headers, params }).pipe(
        map(response => response.data || []),
      );
    });
  }

  // Cria uma categoria para o perfil ativo.
  createCategory(categoryData: Partial<Category>): Observable<Category> {
    return this.withAuthHeaders(headers =>
      this.http.post<CategoryResponse>(this.apiUrl, categoryData, { headers }).pipe(
        map(response => response.data),
      ),
    );
  }

  // Atualiza uma categoria existente.
  updateCategory(id: string, categoryData: Partial<Category>): Observable<Category> {
    return this.withAuthHeaders(headers =>
      this.http.patch<CategoryResponse>(`${this.apiUrl}/${id}`, categoryData, { headers }).pipe(
        map(response => response.data),
      ),
    );
  }

  // Remove uma categoria existente.
  deleteCategory(id: string): Observable<boolean> {
    return this.withAuthHeaders(headers =>
      this.http.delete<CategoryDeleteResponse>(`${this.apiUrl}/${id}`, { headers }).pipe(
        map(response => response.status === 'success'),
      ),
    );
  }
}
