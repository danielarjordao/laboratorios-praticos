import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap, of, shareReplay, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import {
  Profile,
  ProfileDeleteResponse,
  ProfileListResponse,
  ProfileResponse,
} from '../models/profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private apiUrl = `${environment.apiUrl}/profiles`;

  // Mantem o perfil ativo selecionado.
  private currentProfileSubject = new BehaviorSubject<Profile | null>(null);

  // Exposicao reativa do perfil ativo.
  currentProfile$ = this.currentProfileSubject.asObservable();

  // Lista de perfis do usuario com cache compartilhado.
  allProfiles$: Observable<Profile[]> = this.authService.currentUser$.pipe(
    switchMap(user => {
      if (!user) {
        this.updateActiveProfile(null);
        return of([]);
      }

      return this.withAuthHeaders(headers => {
        const params = new HttpParams().set('user_id', user.id);

        return this.http.get<ProfileListResponse>(this.apiUrl, { headers, params }).pipe(
          map(response => response.data || []),
          tap(profiles => this.ensureActiveProfile(profiles)),
        );
      });
    }),
    shareReplay(1),
  );

  // Atualiza o perfil ativo fora do ciclo de deteccao atual.
  private updateActiveProfile(profile: Profile | null): void {
    setTimeout(() => {
      this.currentProfileSubject.next(profile);
    });
  }

  // Garante um perfil ativo valido apos recarregar a lista.
  private ensureActiveProfile(profiles: Profile[]): void {
    if (profiles.length === 0) {
      this.updateActiveProfile(null);
      return;
    }

    const currentProfileId = this.currentProfileSubject.value?.id;
    const currentStillExists = profiles.some(profile => profile.id === currentProfileId);

    if (!currentStillExists) {
      this.updateActiveProfile(profiles[0]);
    }
  }

  // Executa operacoes HTTP reutilizando o mesmo fluxo de token/header.
  private withAuthHeaders<T>(
    requestFactory: (headers: HttpHeaders) => Observable<T>,
  ): Observable<T> {
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

  // Permite trocar o perfil ativo pela UI.
  switchProfile(profile: Profile): void {
    this.updateActiveProfile(profile);
  }

  // Cria um perfil e ativa automaticamente quando necessario.
  createProfile(profileData: Partial<Profile>): Observable<Profile> {
    return this.withAuthHeaders(headers =>
      this.http.post<ProfileResponse>(this.apiUrl, profileData, { headers }).pipe(
        map(response => response.data),
        tap(newProfile => {
          if (!this.currentProfileSubject.value) {
            this.updateActiveProfile(newProfile);
          }
        }),
      ),
    );
  }

  // Atualiza um perfil e sincroniza o estado ativo.
  updateProfile(id: string, profileData: Partial<Profile>): Observable<Profile> {
    return this.withAuthHeaders(headers =>
      this.http.patch<ProfileResponse>(`${this.apiUrl}/${id}`, profileData, { headers }).pipe(
        map(response => response.data),
        tap(updatedProfile => {
          if (this.currentProfileSubject.value?.id === updatedProfile.id) {
            this.updateActiveProfile(updatedProfile);
          }
        }),
      ),
    );
  }

  // Remove um perfil e limpa o estado ativo se necessario.
  deleteProfile(id: string): Observable<boolean> {
    return this.withAuthHeaders(headers =>
      this.http.delete<ProfileDeleteResponse>(`${this.apiUrl}/${id}`, { headers }).pipe(
        map(response => response.status === 'success'),
        tap(success => {
          if (success && this.currentProfileSubject.value?.id === id) {
            this.updateActiveProfile(null);
          }
        }),
      ),
    );
  }
}
