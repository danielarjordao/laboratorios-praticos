import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, filter, pairwise, startWith } from 'rxjs';
import { Router } from '@angular/router';

import { TransactionService } from '../../services/transaction';
import { TagService } from '../../services/tag';
import { CategoryService } from '../../services/category';
import { AccountService } from '../../services/account';
import { ProfileService } from '../../services/profile';
import { PreferencesService } from '../../services/preferences';
import { LoadingIndicator } from '../../resources/loading-indicator/loading-indicator';

import { TransactionFilters, TransactionWithDetails } from '../../models/transaction';
import { Tag } from '../../models/tag';
import { Account } from '../../models/account';
import { Category } from '../../models/category';

type TransactionsFilterFormValue = {
  search: string | null;
  type: string | null;
  tagId: string | null;
  categoryId: string | null;
  accountId: string | null;
  month: number | null;
  year: number | null;
  page: number | null;
  limit: number | null;
  sortBy: string | null;
  sortOrder: string | null;
};

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, LoadingIndicator],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css']
})
export class Transactions implements OnInit, OnDestroy {
  private router = inject(Router);
  private transactionService = inject(TransactionService);
  private tagService = inject(TagService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);
  private profileService = inject(ProfileService);
  private preferences = inject(PreferencesService);
  private cdr = inject(ChangeDetectorRef);

  transactions: TransactionWithDetails[] = [];
  tags: Tag[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];
  totalRecords: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';

  // Novo estado para o toggle dos filtros avançados
  showFilters: boolean = false;

  private destroy$ = new Subject<void>();
  private currentProfileId: string | null = null;
  Math = Math;

  // Cabeçalhos padrão para exportação CSV.
  private readonly csvHeaders = [
    'Data',
    'Descrição',
    'Tipo',
    'Categoria',
    'Conta Origem',
    'Conta Destino',
    'Valor',
    'Status',
    'Tags'
  ];

  filterForm = new FormGroup({
    search: new FormControl<string>(''),
    type: new FormControl<string>(''),
    tagId: new FormControl<string>(''),
    categoryId: new FormControl<string>(''),
    accountId: new FormControl<string>(''),
    month: new FormControl<number>(new Date().getMonth() + 1),
    year: new FormControl<number>(new Date().getFullYear()),
    page: new FormControl<number>(1),
    limit: new FormControl<number>(20),
    sortBy: new FormControl<string>('date'),
    sortOrder: new FormControl<string>('desc')
  });

  ngOnInit(): void {

    // Tenta restaurar filtros salvos na sessão para manter estado entre navegações.
    const previousFilters = this.transactionService.getSavedFilters();
    if (previousFilters) {
      this.filterForm.patchValue(previousFilters, { emitEvent: false });
    }

    // Observa mudanças nas preferências para re-renderizar a página (ex: formatação de moeda).
    this.preferences.preferences$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.markForCheck();
      });


    // Observa o perfil atual para carregar dados contextuais da página.
    this.profileService.currentProfile$
      .pipe(
        takeUntil(this.destroy$),
        filter(profile => !!profile)
      )
      .subscribe(profile => {
        this.currentProfileId = profile!.id;
        this.loadInitialData(this.currentProfileId);
      });


    // Observa alterações dos filtros e dispara nova leitura paginada.
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        startWith(this.filterForm.getRawValue()),
        pairwise(),
      )
      .subscribe(([previous, current]) => {
        if (this.currentProfileId) {
          if (this.shouldResetPage(previous, current) && (current.page ?? 1) !== 1) {
            this.filterForm.patchValue({ page: 1 }, { emitEvent: false });
          }

          this.loadTransactions();
        }
      });
  }

  // Formata valor usando locale e moeda dinâmicos.
  formatCurrency(value: number): string {
    return this.preferences.formatCurrency(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    const currentFilters = this.filterForm.getRawValue();
    this.transactionService.setSavedFilters(currentFilters);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Carrega dados iniciais (tags + transações) para o perfil ativo.
  private loadInitialData(profileId: string): void {
    this.loadTags(profileId);
    this.loadTransactions();
    this.loadCategories(profileId);
    this.loadAccounts(profileId);
  }

  // Constrói filtros da API a partir do estado atual do formulário.
  private buildTransactionFilters(): TransactionFilters {
    const formValues = this.filterForm.getRawValue();

    return {
      profile_id: this.currentProfileId || undefined,
      month: formValues.month ?? undefined,
      year: formValues.year ?? undefined,
      type: formValues.type || undefined,
      search: formValues.search || undefined,
      page: formValues.page ?? 1,
      limit: formValues.limit ?? 20,
      sortBy: formValues.sortBy || 'date',
      sortOrder: formValues.sortOrder || 'desc',
      tagId: formValues.tagId || undefined,
      categoryId: formValues.categoryId || undefined,
      accountId: formValues.accountId || undefined,
    };
  }

  // Reinicia a paginação quando filtros de conteúdo mudam.
  private shouldResetPage(previous: Partial<TransactionsFilterFormValue>, current: Partial<TransactionsFilterFormValue>): boolean {
    return (previous.search ?? null) !== (current.search ?? null)
      || (previous.type ?? null) !== (current.type ?? null)
      || (previous.tagId ?? null) !== (current.tagId ?? null)
      || (previous.categoryId ?? null) !== (current.categoryId ?? null)
      || (previous.accountId ?? null) !== (current.accountId ?? null)
      || (previous.month ?? null) !== (current.month ?? null)
      || (previous.year ?? null) !== (current.year ?? null)
      || (previous.sortBy ?? null) !== (current.sortBy ?? null)
      || (previous.sortOrder ?? null) !== (current.sortOrder ?? null)
      || (previous.limit ?? null) !== (current.limit ?? null);
  }

  loadTransactions(): void {
    if (!this.currentProfileId) return;

    this.isLoading = true;
    this.errorMessage = '';

    const filters = this.buildTransactionFilters();

    this.transactionService.getTransactions(this.currentProfileId, filters).subscribe({
      next: (response) => {
        this.transactions = response.data;
        this.totalRecords = response.total;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load transactions.';
        this.isLoading = false;
        console.error('Error fetching transactions:', err);
        this.cdr.markForCheck();
      }
    });
  }

  loadTags(profileId: string): void {
    this.tagService.getTags(profileId).subscribe({
      next: (tags) => {
        this.tags = tags;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error fetching tags:', err)
    });
  }

  loadCategories(profileId: string): void {
    this.categoryService.getCategories(profileId).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.markForCheck();
      }
    });
  }

  loadAccounts(profileId: string): void {
    this.accountService.getAccounts(profileId).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.cdr.markForCheck();
      }
    });
  }

  // Resolve a classe de cor do ícone com base no tipo da transação.
  getTransactionIconClass(tx: TransactionWithDetails): string {
    if (tx.type === 'INCOME') return 'tx-icon-income';
    if (tx.type === 'EXPENSE') return 'tx-icon-expense';
    return 'tx-icon-transfer';
  }

  // Mapeia uma transação para uma linha CSV no padrão da aplicação.
  private mapTransactionToCsvRow(tx: TransactionWithDetails): string {
    const tagsNames = tx.transaction_tags
      ? tx.transaction_tags.map((tt) => tt.tags.name).join('; ')
      : '';

    return [
      tx.date,
      `"${tx.description || ''}"`,
      tx.type,
      `"${tx.categories?.name || 'Sem Categoria'}"`,
      `"${tx.origin_account?.name || ''}"`,
      `"${tx.destination_account?.name || ''}"`,
      tx.amount,
      tx.status,
      `"${tagsNames}"`
    ].join(';');
  }

  exportToCsv(): void {
    if (this.transactions.length === 0) return;

    // Constrói conteúdo CSV no formato separado por ponto e vírgula.
    const csvRows = this.transactions.map((tx) => this.mapTransactionToCsvRow(tx));
    const csvContent = [this.csvHeaders.join(';'), ...csvRows].join('\n');

    // Cria o ficheiro e dispara o download no navegador.
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openNewTransactionForm(): void {
    this.router.navigate(['/transactions/new']);
  }

  openTransactionDetails(id: string): void {
    this.router.navigate(['/transactions/edit', id]);
  }

  // TODO(transactions-planning): Implementar ações de parcelamento e recorrência | Done when: fluxos e serviços de installments/recurring estiverem integrados.
}
