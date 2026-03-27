import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { GoTrueClient } from '@supabase/auth-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private supabase: SupabaseClient;
  private authClient: GoTrueClient;

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

  // Obter utilizador atual
  async getCurrentUser() {
    // Verifica a sessão local primeiro (não faz chamadas de rede lentas)
    const { data: { session } } = await this.authClient.getSession();
    return session?.user || null;
  }
}
