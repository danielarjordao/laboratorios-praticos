import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap, catchError, shareReplay, tap, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { SettingsResponse, UserSettings } from '../models/settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(Auth);
  private readonly apiUrl = `${environment.apiUrl}/user-settings`;
  private readonly settingsCache = new Map<string, Observable<UserSettings>>();

  private withAuthHeaders<T>(requestFactory: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => requestFactory(this.buildAuthHeaders(token))),
    );
  }

  // Constrói os headers de autenticação para as requisições, incluindo o token de acesso se disponível. Este método é utilizado internamente para garantir que todas as requisições ao backend sejam autenticadas corretamente.
  private buildAuthHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Armazena as configurações no cache para evitar múltiplas requisições ao backend para o mesmo usuário. O cache é invalidado em caso de erro, garantindo que tentativas subsequentes possam recuperar os dados atualizados.
  private setCachedValue(userId: string, value: UserSettings): void {
    this.settingsCache.set(userId, of(value).pipe(shareReplay(1)));
  }

  // Busca as configurações passando o user_id como query param
  getUserSettings(userId: string): Observable<UserSettings> {
    const cached = this.settingsCache.get(userId);
    if (cached) {
      return cached;
    }

    const request$ = this.withAuthHeaders(headers => {
      const params = new HttpParams().set('user_id', userId);
      return this.http.get<SettingsResponse>(this.apiUrl, { headers, params }).pipe(
        map(response => response.data)
      );
    }).pipe(
      shareReplay(1),
      catchError((error: unknown) => {
        this.settingsCache.delete(userId);
        return throwError(() => error);
      }),
    );

    this.settingsCache.set(userId, request$);
    return request$;
  }

  // Cria as configurações iniciais
  createUserSettings(settingsData: Partial<UserSettings>): Observable<UserSettings> {
    return this.withAuthHeaders(headers =>
      this.http.post<SettingsResponse>(this.apiUrl, settingsData, { headers }).pipe(
        map(response => response.data)
      )
    ).pipe(
      tap(created => this.setCachedValue(created.user_id, created)),
    );
  }

  // Atualiza as configurações passando o user_id na rota
  updateUserSettings(userId: string, settingsData: Partial<UserSettings>): Observable<UserSettings> {
    return this.withAuthHeaders(headers =>
      this.http.patch<SettingsResponse>(`${this.apiUrl}/${userId}`, settingsData, { headers }).pipe(
        map(response => response.data)
      )
    ).pipe(
      tap(updated => this.setCachedValue(userId, updated)),
    );
  }

  // Atualiza tema e cria settings caso o registo ainda nao exista.
  upsertThemePreference(userId: string, theme: UserSettings['theme']): Observable<UserSettings> {
    return this.updateUserSettings(userId, { theme }).pipe(
      catchError(() => this.createUserSettings({ user_id: userId, theme })),
    );
  }
}
