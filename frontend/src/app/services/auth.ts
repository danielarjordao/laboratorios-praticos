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

  // Obter utilizador atual
  async getCurrentUser() {
    const { data: { user } } = await this.authClient.getUser();
    return user;
  }
}
