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
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  // --- Fluxo de Autenticação ---
  { path: 'auth/login', component: Login, canActivate: [guestGuard] },

  // --- Fluxo Principal (Com Sidebar) ---
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'transactions', component: Transactions, canActivate: [authGuard] },

  { path: 'accounts', component: Accounts, canActivate: [authGuard] },

  { path: 'past-12-months', component: Past12Months, canActivate: [authGuard] },
  { path: 'forecast', component: Forecast, canActivate: [authGuard] },
  { path: 'goals', component: Goals, canActivate: [authGuard] },
  { path: 'categories', component: Categories, canActivate: [authGuard] },
  { path: 'budgets', component: Budgets, canActivate: [authGuard] },

  { path: 'settings', component: Settings, canActivate: [authGuard] },

  { path: 'terms', component: Terms },

  // --- Redirecionamentos ---
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
