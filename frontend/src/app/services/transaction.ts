import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transaction, BackendResponseTransactions } from '../models/transaction';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private authService = inject(Auth);

  private apiUrl = `${environment.apiUrl}/transactions`;

  // Método para obter transações com filtros opcionais (mês, ano, tipo e categoria)
  getTransactions(filters?: { month?: number; year?: number; type?: string; categoryId?: string; search?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: string }): Observable<{ data: Transaction[]; total: number }> {
	// Combina a obtenção do token de acesso e do utilizador atual
	const authDataPromise = Promise.all([
      this.authService.getAccessToken(),
      this.authService.getCurrentUser()
    ]);

    // Obtém o token de acesso do serviço de autenticação e, em seguida, faz a requisição HTTP com os filtros aplicados
    return from(authDataPromise).pipe(

      switchMap(([token, user]) => {
		const profileId = '2b54bc22-1808-41db-bf09-15f5abb22b0a';

        let headers = new HttpHeaders();
        // Se houver token, adiciona-o ao cabeçalho
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }

		let params = new HttpParams();

		// TODO: O profile_id deve ser obtido a partir do estado do utilizador ou de um serviço de perfis real, em vez de ser hardcoded
		if (profileId) {
          params = params.set('profile_id', profileId);
        }

		// Prepara os parâmetros de consulta com base nos filtros fornecidos
        if (filters) {
          if (filters.month) params = params.set('month', filters.month.toString());
          if (filters.year) params = params.set('year', filters.year.toString());
          if (filters.type) params = params.set('type', filters.type);
          if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
          if (filters.search) params = params.set('search', filters.search);
          if (filters.page) params = params.set('page', filters.page.toString());
          if (filters.limit) params = params.set('limit', filters.limit.toString());
          if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
          if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
        }

		// Faz a requisição GET para obter as transações com os cabeçalhos e parâmetros configurados
        return this.http.get<BackendResponseTransactions>(this.apiUrl, { headers, params }).pipe(
			map(response => ({
				data: Array.isArray(response.data) ? response.data : [],
				total: response.totalRecords || 0
			}))
		);
      })
    );
  }

  // Métodos adicionais para criar, atualizar e deletar transações podem ser implementados aqui seguindo o mesmo padrão de autenticação
}
