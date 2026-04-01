import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, forkJoin, takeUntil, map, distinctUntilChanged, finalize } from 'rxjs';
import { AccountService } from '../../services/account';
import { TransactionService } from '../../services/transaction';
import { ProfileService } from '../../services/profile';
import { PreferencesService } from '../../services/preferences';
import { LoadingIndicator } from '../../resources/loading-indicator/loading-indicator';
import { TransactionWithDetails } from '../../models/transaction';

interface DashboardExpenseCategory {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingIndicator],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);
  private readonly profileService = inject(ProfileService);
  private readonly preferences = inject(PreferencesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  isLoading = true;
  errorMessage = '';
  private currentProfileId: string | null = null;

  // Métricas dos Cards
  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpense = 0;

  // Tabela Recente
  recentTransactions: TransactionWithDetails[] = [];
  expenseByCategory: DashboardExpenseCategory[] = [];

  ngOnInit(): void {
    this.preferences.preferences$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });

    this.profileService.currentProfile$
      .pipe(
        takeUntil(this.destroy$),
        map(profile => profile?.id || null),
        distinctUntilChanged(),
      )
      .subscribe(profileId => {
        this.currentProfileId = profileId;

        if (!this.currentProfileId) {
          this.resetMetrics();
          this.isLoading = false;
          this.errorMessage = 'Select a profile to load dashboard data.';
          this.cdr.detectChanges();
          return;
        }

        this.loadDashboardData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Formata valores monetarios usando preferencias globais.
  formatCurrency(value: number | null | undefined): string {
    return this.preferences.formatCurrency(value);
  }

  // Resolve classe visual do icone por tipo da transacao.
  getTransactionIconClass(tx: TransactionWithDetails): string {
    if (tx.type === 'INCOME') {
      return 'tx-icon-income';
    }

    if (tx.type === 'EXPENSE') {
      return 'tx-icon-expense';
    }

    return 'tx-icon-transfer';
  }

  // Restaura indicadores quando nao ha perfil ativo.
  private resetMetrics(): void {
    this.totalBalance = 0;
    this.monthlyIncome = 0;
    this.monthlyExpense = 0;
    this.recentTransactions = [];
    this.expenseByCategory = [];
  }

  // Agrupa despesas por categoria para exibir no painel lateral.
  private buildExpenseByCategory(transactions: TransactionWithDetails[]): void {
    const expenseTransactions = transactions.filter(tx => tx.type === 'EXPENSE');

    if (expenseTransactions.length === 0) {
      this.expenseByCategory = [];
      return;
    }

    const grouped = new Map<string, { icon: string; amount: number }>();

    expenseTransactions.forEach(tx => {
      const categoryName = tx.categories?.name || 'Uncategorized';
      const categoryIcon = tx.categories?.icon || 'category';
      const current = grouped.get(categoryName);

      if (current) {
        current.amount += Number(tx.amount);
        return;
      }

      grouped.set(categoryName, {
        icon: categoryIcon,
        amount: Number(tx.amount),
      });
    });

    const totalExpenses = Array.from(grouped.values())
      .reduce((sum, category) => sum + category.amount, 0);

    this.expenseByCategory = Array.from(grouped.entries())
      .map(([name, data]) => ({
        name,
        icon: data.icon,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }

  // Carrega dados principais do dashboard para o perfil ativo.
  loadDashboardData(): void {
    if (!this.currentProfileId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // 1. Obter a data atual para os filtros (Ano e Mês corrente)
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 2. Preparar os pedidos em paralelo
    const accounts$ = this.accountService.getAccounts(this.currentProfileId);

    // Assumindo que o teu readTransactions aceita filtros.
    // Ajusta o método no TransactionService se necessário para aceitar month, year e limit.
    const transactions$ = this.transactionService.getTransactions(this.currentProfileId, {
      month: currentMonth,
      year: currentYear,
      limit: 200,
      sortBy: 'date',
      sortOrder: 'desc'
    });

    // 3. Executar e calcular
    forkJoin({
      accounts: accounts$,
      transactionsRes: transactions$
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
      next: ({ accounts, transactionsRes }) => {
        // Calcular Saldo Total (soma de todas as contas)
        this.totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

        // Processar as transações do mês
        const txs = transactionsRes.data || [];
        this.recentTransactions = txs.slice(0, 5); // Garante que só mostramos 5 na tabela

        // Resetar valores
        this.monthlyIncome = 0;
        this.monthlyExpense = 0;

        // Somar Receitas e Despesas do mês
        txs.forEach(tx => {
          if (tx.type === 'INCOME') {
            this.monthlyIncome += Number(tx.amount);
          } else if (tx.type === 'EXPENSE') {
            this.monthlyExpense += Number(tx.amount);
          }
        });

        this.buildExpenseByCategory(txs);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.errorMessage = 'Failed to load dashboard data.';
      }
    });
  }
}
