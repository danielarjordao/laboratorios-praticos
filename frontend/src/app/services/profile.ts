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
  private readonly http = inject(HttpClient);
  private readonly authService = inject(Auth);
  private readonly apiUrl = `${environment.apiUrl}/profiles`;
  private readonly activeProfileStoragePrefix = 'active_profile_id';
  private currentUserId: string | null = null;

  // Mantem o perfil ativo selecionado.
  private currentProfileSubject = new BehaviorSubject<Profile | null>(null);

  // Exposicao reativa do perfil ativo.
  currentProfile$ = this.currentProfileSubject.asObservable();

  // Lista de perfis do usuario com cache compartilhado.
  allProfiles$: Observable<Profile[]> = this.authService.currentUser$.pipe(
    switchMap(user => {
      if (!user) {
        this.currentUserId = null;
        this.setActiveProfile(null, false);
        return of([]);
      }

      this.currentUserId = user.id;

      return this.withAuthHeaders(headers => {
        const params = new HttpParams().set('user_id', user.id);

        return this.http.get<ProfileListResponse>(this.apiUrl, { headers, params }).pipe(
          map(response => response.data || []),
          tap(profiles => this.ensureActiveProfile(profiles, user.id)),
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

  // Salva id do perfil ativo por usuario para restaurar no F5.
  private persistActiveProfile(profileId: string | null): void {
    if (!this.currentUserId || typeof window === 'undefined') {
      return;
    }

    const storageKey = this.getActiveProfileStorageKey(this.currentUserId);

    if (!profileId) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, profileId);
  }

  // Recupera id salvo do perfil ativo para o usuario.
  private getSavedActiveProfileId(userId: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(this.getActiveProfileStorageKey(userId));
  }

  // Monta a chave de storage com escopo por usuario.
  private getActiveProfileStorageKey(userId: string): string {
    return `${this.activeProfileStoragePrefix}:${userId}`;
  }

  // Atualiza estado ativo e persiste quando necessario.
  private setActiveProfile(profile: Profile | null, shouldPersist = true): void {
    this.updateActiveProfile(profile);

    if (shouldPersist) {
      this.persistActiveProfile(profile?.id || null);
    }
  }

  // Garante um perfil ativo valido apos recarregar a lista.
  private ensureActiveProfile(profiles: Profile[], userId: string): void {
    if (profiles.length === 0) {
      this.setActiveProfile(null);
      return;
    }

    const currentProfileId = this.currentProfileSubject.value?.id;
    const currentStillExists = profiles.some(profile => profile.id === currentProfileId);
    if (currentStillExists) {
      this.persistActiveProfile(currentProfileId || null);
      return;
    }

    const savedProfileId = this.getSavedActiveProfileId(userId);
    const savedProfile = profiles.find(profile => profile.id === savedProfileId);

    if (savedProfile) {
      this.setActiveProfile(savedProfile);
      return;
    }

    this.setActiveProfile(profiles[0]);
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
    this.setActiveProfile(profile);
  }

  // Cria um perfil e ativa automaticamente quando necessario.
  createProfile(profileData: Partial<Profile>): Observable<Profile> {
    return this.withAuthHeaders(headers =>
      this.http.post<ProfileResponse>(this.apiUrl, profileData, { headers }).pipe(
        map(response => response.data),
        tap(newProfile => {
          if (!this.currentProfileSubject.value) {
            this.setActiveProfile(newProfile);
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
            this.setActiveProfile(updatedProfile);
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
            this.setActiveProfile(null);
          }
        }),
      ),
    );
  }
}
