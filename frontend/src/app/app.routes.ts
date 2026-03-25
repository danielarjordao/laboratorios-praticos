import { Routes } from '@angular/router';
import { } from './components/login/login';
import { } from './components/dashboard/dashboard';
import { } from './components/transactions/transactions';
import { } from './components/settings/settings';

export const routes: Routes = [
  // Rota inicial: Redireciona para o login (ou dashboard se já logado)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', title: 'Login | Finanças' },
  { path: 'dashboard', title: 'Dashboard | Finanças' },
  { path: 'transactions', title: 'Transações | Finanças' },
  { path: 'settings', title: 'Configurações | Finanças' },

  // Rota "Wildcard" para páginas não encontradas
  { path: '**', redirectTo: 'login' }
];
