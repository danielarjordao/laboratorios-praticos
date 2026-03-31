import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { Router } from '@angular/router';

import { TransactionService } from '../../services/transaction';
import { TagService } from '../../services/tag';
import { ProfileService } from '../../services/profile';

import { TransactionWithDetails } from '../../models/transaction';
import { Tag } from '../../models/tag';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css']
})
export class Transactions implements OnInit, OnDestroy {
  private router = inject(Router);
  private transactionService = inject(TransactionService);
  private tagService = inject(TagService);
  private profileService = inject(ProfileService);
  private cdr = inject(ChangeDetectorRef);

  transactions: TransactionWithDetails[] = [];
  tags: Tag[] = [];
  totalRecords: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';

  // Novo estado para o toggle dos filtros avançados
  showFilters: boolean = false;

  private destroy$ = new Subject<void>();
  private currentProfileId: string | null = null;
  Math = Math;

  filterForm = new FormGroup({
    search: new FormControl<string>(''),
    type: new FormControl<string>(''),
    tagId: new FormControl<string>(''),
    month: new FormControl<number>(new Date().getMonth() + 1),
    year: new FormControl<number>(new Date().getFullYear()),
    page: new FormControl<number>(1),
    limit: new FormControl<number>(20),
    sortBy: new FormControl<string>('date'),
    sortOrder: new FormControl<string>('desc')
  });

  ngOnInit(): void {
    this.profileService.currentProfile$
      .pipe(
        takeUntil(this.destroy$),
        filter(profile => !!profile)
      )
      .subscribe(profile => {
        this.currentProfileId = profile!.id;
        this.loadData(this.currentProfileId);
      });

    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.currentProfileId) {
          this.loadTransactions();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  private loadData(profileId: string): void {
    this.loadTags(profileId);
    this.loadTransactions();
  }

  loadTransactions(): void {
    if (!this.currentProfileId) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formValues = this.filterForm.getRawValue();

    const filters = {
      profile_id: this.currentProfileId,
      month: formValues.month ?? undefined,
      year: formValues.year ?? undefined,
      type: formValues.type || undefined,
      search: formValues.search || undefined,
      page: formValues.page ?? 1,
      limit: formValues.limit ?? 20,
      sortBy: formValues.sortBy || 'date',
      sortOrder: formValues.sortOrder || 'desc',
      tagId: formValues.tagId || undefined
    };

    this.transactionService.getTransactions(filters).subscribe({
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

  exportToCsv(): void {
    // Mantém a tua lógica de exportação inalterada
    if (!this.transactions.length) return;
    const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Status', 'Amount'];
    const csvData = this.transactions.map(tx => [
      tx.date,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${tx.categories?.name || '---'}"`,
      `"${tx.origin_account?.name || '---'}"`,
      tx.type,
      tx.status,
      tx.amount
    ].join(';'));

    const csvString = [headers.join(';'), ...csvData].join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  openNewTransactionForm(): void {
    this.router.navigate(['/transactions/new']);
  }

  openTransactionDetails(id: string): void {
  this.router.navigate(['/transactions/edit', id]);
  }
}
