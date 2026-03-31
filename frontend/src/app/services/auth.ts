import { Injectable, NgZone, inject } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthOperationResult, AuthUser, ProfileUpdatePayload } from '../models/authUser';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly supabase: SupabaseClient;
  private readonly ngZone = inject(NgZone);

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public readonly currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  // Emite usuario atual dentro da zona do Angular.
  private emitCurrentUser(user: AuthUser | null): void {
    this.ngZone.run(() => {
      this.currentUserSubject.next(user);
    });
  }

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Carrega a sessao inicial da aplicacao.
    this.supabase.auth.getSession().then(({ data }) => {
      this.emitCurrentUser(this.mapToAuthUser(data.session?.user));
    });

    // Escuta mudancas de autenticacao para manter estado sincronizado.
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.emitCurrentUser(this.mapToAuthUser(session?.user));
    });
  }

  // Converte usuario do Supabase para o modelo da aplicacao.
  private mapToAuthUser(supabaseUser: SupabaseUser | undefined | null): AuthUser | null {
    if (!supabaseUser) {
      return null;
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: this.getMetadataValue(supabaseUser, 'first_name'),
      lastName: this.getMetadataValue(supabaseUser, 'last_name'),
    };
  }

  // Retorna valor de metadata com fallback seguro.
  private getMetadataValue(user: SupabaseUser, key: string): string {
    const value = user.user_metadata?.[key];
    return typeof value === 'string' ? value : '';
  }

  // Padroniza retorno de sucesso/erro das operacoes.
  private buildOperationResult(error: { message?: string } | null): AuthOperationResult {
    if (!error) {
      return { success: true };
    }

    return {
      success: false,
      error: error.message || 'Authentication request failed.',
    };
  }

  // Cria nova conta no Supabase.
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<AuthOperationResult> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    return this.buildOperationResult(error);
  }

  // Realiza autenticacao por email/senha.
  async signIn(email: string, password: string): Promise<AuthOperationResult> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    return this.buildOperationResult(error);
  }

  // Encerra a sessao atual.
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  // Atualiza dados de perfil e/ou senha.
  async updateProfile(
    firstName?: string,
    lastName?: string,
    password?: string,
  ): Promise<AuthOperationResult> {
    const payload: ProfileUpdatePayload = { firstName, lastName, password };
    const updates: { data?: { first_name?: string; last_name?: string }; password?: string } = {};

    if (payload.firstName || payload.lastName) {
      updates.data = {};
      if (payload.firstName) {
        updates.data.first_name = payload.firstName;
      }
      if (payload.lastName) {
        updates.data.last_name = payload.lastName;
      }
    }

    if (payload.password) {
      updates.password = payload.password;
    }

    const { error } = await this.supabase.auth.updateUser(updates);

    return this.buildOperationResult(error);
  }

  // Retorna o usuario atual sincronizado no formato local.
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return this.mapToAuthUser(session?.user);
  }

  // Fornece token JWT para chamadas ao backend.
  async getAccessToken(): Promise<string | undefined> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token;
  }
}
