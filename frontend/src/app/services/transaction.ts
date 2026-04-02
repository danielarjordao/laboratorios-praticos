import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transaction, BackendResponseTransactions, TransactionFilters, TransactionWithDetails } from '../models/transaction';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private apiUrl = `${environment.apiUrl}/transactions`;

  // Função auxiliar para adicionar headers de autenticação a cada requisição.
  private savedFilters: Partial<TransactionFilters> = {};

  // Executa uma chamada HTTP anexando token de autenticação quando disponível.
  private withAuthHeaders<T>(requestFactory: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return requestFactory(headers);
      })
    );
  }

  // Constrói query params de forma dinâmica, removendo valores vazios.
  private buildHttpParams(filters?: TransactionFilters): HttpParams {
    let params = new HttpParams();

    if (!filters) {
      return params;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return params;
  }

  // Busca transações com base nos filtros informados pela página.
  getTransactions(currentProfileId: string, filters?: TransactionFilters): Observable<{ data: Transaction[]; total: number }> {
    return this.withAuthHeaders((headers) => {
      const params = this.buildHttpParams({
        ...filters,
        profile_id: currentProfileId,
      });

      return this.http.get<BackendResponseTransactions>(this.apiUrl, { headers, params }).pipe(
        map(response => ({
          data: Array.isArray(response.data) ? response.data : [],
          total: response.totalRecords || 0
        }))
      );
    });
  }

  // Cria uma nova transação.
  createTransaction(data: Partial<Transaction>): Observable<Transaction> {
    return this.withAuthHeaders((headers) => {
        return this.http.post<{ status: string, data: Transaction }>(this.apiUrl, data, { headers }).pipe(
          map(response => response.data)
        );
      }
    );
  }

  // Atualiza uma transação existente.
  updateTransaction(id: string, data: Partial<Transaction>): Observable<Transaction> {
    return this.withAuthHeaders((headers) => {
        return this.http.patch<{ status: string, data: Transaction }>(`${this.apiUrl}/${id}`, data, { headers }).pipe(
          map(response => response.data)
        );
      }
    );
  }

  // Remove uma transação.
  deleteTransaction(id: string): Observable<boolean> {
    return this.withAuthHeaders((headers) => {
        return this.http.delete<{ status: string }>(`${this.apiUrl}/${id}`, { headers }).pipe(
          map(response => response.status === 'success')
        );
      }
    );
  }

  // Busca uma transação específica pelo ID.
  getTransactionById(id: string): Observable<TransactionWithDetails> {
    return this.withAuthHeaders((headers) => {
      return this.http.get<{ status: string, data: TransactionWithDetails }>(`${this.apiUrl}/${id}`, { headers }).pipe(
        map(response => response.data)
      );
    });
  }

  setSavedFilters(filters: any): void {
    this.savedFilters = filters;
  }

  getSavedFilters(): any {
    return this.savedFilters;
  }
}
