import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import {
  Account,
  AccountDeleteResponse,
  AccountListResponse,
  AccountResponse,
} from '../models/account';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(Auth);
  private readonly apiUrl = `${environment.apiUrl}/accounts`;

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

  // Retorna as contas associadas a um perfil.
  getAccounts(profileId: string): Observable<Account[]> {
    return this.withAuthHeaders(headers => {
      const params = new HttpParams().set('profile_id', profileId);

      return this.http.get<AccountListResponse>(this.apiUrl, { headers, params }).pipe(
        map(response => response.data || []),
      );
    });
  }

  // Cria uma conta para o perfil ativo.
  createAccount(accountData: Partial<Account>): Observable<Account> {
    return this.withAuthHeaders(headers =>
      this.http.post<AccountResponse>(this.apiUrl, accountData, { headers }).pipe(
        map(response => response.data),
      ),
    );
  }

  // Atualiza uma conta existente.
  updateAccount(id: string, accountData: Partial<Account>): Observable<Account> {
    return this.withAuthHeaders(headers =>
      this.http.patch<AccountResponse>(`${this.apiUrl}/${id}`, accountData, { headers }).pipe(
        map(response => response.data),
      ),
    );
  }

  // Remove uma conta existente.
  deleteAccount(id: string): Observable<boolean> {
    return this.withAuthHeaders(headers =>
      this.http.delete<AccountDeleteResponse>(`${this.apiUrl}/${id}`, { headers }).pipe(
        map(response => response.status === 'success'),
      ),
    );
  }
}
