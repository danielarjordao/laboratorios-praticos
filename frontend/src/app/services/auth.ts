import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import type { GoTrueClient } from '@supabase/auth-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private supabase: SupabaseClient;
  private authClient: GoTrueClient;

  // Estado do utilizador atual para partilhar entre componentes
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.authClient = this.supabase.auth as unknown as GoTrueClient;
  }

  // Registo com metadados (primeiro e último nome)
  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.authClient.signUp({
      email: email,
      password: password,
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

  // Login
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.authClient.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Logout
  async signOut(): Promise<void> {
    await this.authClient.signOut();
  }

  // Atualizar perfil (Nome, Sobrenome e Password)
  async updateProfile(firstName?: string, lastName?: string, password?: string): Promise<{ success: boolean; error?: string }> {
    const updates: any = { data: {} };

    // Atualiza os metadados se os nomes forem fornecidos
    if (firstName) updates.data.first_name = firstName;
    if (lastName) updates.data.last_name = lastName;

    if (password) updates.password = password;

    const { error } = await this.authClient.updateUser(updates);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  updateUserState(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  // Obter utilizador atual
  async getCurrentUser() {
    // Verifica a sessão local primeiro (não faz chamadas de rede lentas)
    const { data: { session } } = await this.authClient.getSession();
    return session?.user || null;
  }

  // Método para verificar se o utilizador está autenticado
  async getAccessToken(): Promise<string | undefined> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token;
  }
}
