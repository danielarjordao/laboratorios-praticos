import { Routes } from '@angular/router';

// Importações (o VS Code pode fazer auto-import disto)
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Transactions } from './components/transactions/transactions';
import { Accounts} from './components/accounts/accounts';
import { Past12Months } from './components/past-12-months/past-12-months';
import { Forecast } from './components/forecast/forecast';
import { Goals } from './components/goals/goals';
import { Categories } from './components/categories/categories';
import { Budgets } from './components/budgets/budgets';
import { Settings } from './components/settings/settings';
import { Terms } from './components/terms/terms';

export const routes: Routes = [
  // --- Fluxo de Autenticação ---
  { path: 'auth/login', component: Login },

  // --- Fluxo Principal (Com Sidebar) ---
  { path: 'dashboard', component: Dashboard },
  { path: 'transactions', component: Transactions },

  { path: 'accounts', component: Accounts },

  { path: 'past-12-months', component: Past12Months },
  { path: 'forecast', component: Forecast },
  { path: 'goals', component: Goals },
  { path: 'categories', component: Categories },
  { path: 'budgets', component: Budgets },

  { path: 'settings', component: Settings },

  { path: 'terms', component: Terms },

  // --- Redirecionamentos ---
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
