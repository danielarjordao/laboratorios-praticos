import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUser } from '../models/authUser';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private supabase: SupabaseClient;

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Carrega a sessão inicial no arranque da aplicação
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUserSubject.next(this.mapToAuthUser(data.session?.user));
    });

    // Ouve ativamente qualquer mudança de estado (Login, Logout, Atualização de Token)
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUserSubject.next(this.mapToAuthUser(session?.user));
    });
  }

  // Transforma o objeto complexo do Supabase no modelo definido para a aplicação
  private mapToAuthUser(supabaseUser: SupabaseUser | undefined | null): AuthUser | null {
    if (!supabaseUser) return null;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: supabaseUser.user_metadata?.['first_name'] || '',
      lastName: supabaseUser.user_metadata?.['last_name'] || ''
    };
  }

  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async updateProfile(firstName?: string, lastName?: string, password?: string): Promise<{ success: boolean; error?: string }> {
    const updates: { data?: { first_name?: string; last_name?: string }; password?: string } = {};

    if (firstName || lastName) {
      updates.data = {};
      if (firstName) updates.data.first_name = firstName;
      if (lastName) updates.data.last_name = lastName;
    }

    if (password) updates.password = password;

    const { error } = await this.supabase.auth.updateUser(updates);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Retorna o utilizador atual (sincronizado) mapeado para o modelo
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return this.mapToAuthUser(session?.user);
  }

  // Fornece o Token JWT para as chamadas à API Express
  async getAccessToken(): Promise<string | undefined> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token;
  }
}
