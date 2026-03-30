import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transaction, BackendResponseTransactions, TransactionFilters } from '../models/transaction';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private apiUrl = `${environment.apiUrl}/transactions`;

  // Fetches transactions. Relies purely on the filters provided by the component.
  getTransactions(filters?: TransactionFilters): Observable<{ data: Transaction[]; total: number }> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        let params = new HttpParams();

        // Dynamically append filters. The component MUST provide the profile_id here.
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            // Check for undefined, null, and empty string to keep URL clean
            if (value !== undefined && value !== null && value !== '') {
              params = params.set(key, value.toString());
            }
          });
        }

        return this.http.get<BackendResponseTransactions>(this.apiUrl, { headers, params }).pipe(
          map(response => ({
            data: Array.isArray(response.data) ? response.data : [],
            total: response.totalRecords || 0
          }))
        );
      })
    );
  }

  // Creates a new transaction
  createTransaction(data: Partial<Transaction>): Observable<Transaction> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.post<{ status: string, data: Transaction }>(this.apiUrl, data, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Updates an existing transaction
  updateTransaction(id: string, data: Partial<Transaction>): Observable<Transaction> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.patch<{ status: string, data: Transaction }>(`${this.apiUrl}/${id}`, data, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Deletes a transaction
  deleteTransaction(id: string): Observable<boolean> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.delete<{ status: string }>(`${this.apiUrl}/${id}`, { headers }).pipe(
          map(response => response.status === 'success')
        );
      })
    );
  }
}
