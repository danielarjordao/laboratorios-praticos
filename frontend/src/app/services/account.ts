import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { Account } from '../models/account';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private apiUrl = `${environment.apiUrl}/accounts`;

  // Retorna as contas associadas a um perfil específico, utilizando o token de acesso para autenticação
  getAccounts(profileId: string): Observable<Account[]> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        const params = new HttpParams().set('profile_id', profileId);

        return this.http.get<{ status: string; data: Account[] }>(this.apiUrl, { headers, params }).pipe(
          map(response => response.data || [])
        );
      })
    );
  }

  // Cria uma nova conta associada a um perfil, enviando os dados para o backend e retornando a conta criada
  createAccount(accountData: Partial<Account>): Observable<Account> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.post<{ status: string; data: Account }>(this.apiUrl, accountData, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Atualiza os dados de uma conta existente, enviando as alterações para o backend e retornando a conta atualizada
  updateAccount(id: string, accountData: Partial<Account>): Observable<Account> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.patch<{ status: string; data: Account }>(`${this.apiUrl}/${id}`, accountData, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Exclui uma conta existente, enviando a solicitação para o backend e retornando um booleano indicando o sucesso da operação
  deleteAccount(id: string): Observable<boolean> {
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
