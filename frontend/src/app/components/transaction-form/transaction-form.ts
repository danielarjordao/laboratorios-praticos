import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin, filter, take } from 'rxjs';

import { TransactionService } from '../../services/transaction';
import { AccountService } from '../../services/account';
import { CategoryService } from '../../services/category';
import { TagService } from '../../services/tag';
import { ProfileService } from '../../services/profile';
import { ConfirmModalService } from '../../services/confirm-modal';
import { checkFieldInvalid } from '../../utils/formUtils';

import { Transaction, TransactionWithDetails } from '../../models/transaction';
import { Account } from '../../models/account';
import { Category } from '../../models/category';
import { Tag } from '../../models/tag';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.html',
  styleUrls: ['./transaction-form.css']
})
export class TransactionForm implements OnInit, OnDestroy {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);
  private profileService = inject(ProfileService);
  private confirmModal = inject(ConfirmModalService);
  private checkFieldInvalid = checkFieldInvalid;
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  accounts: Account[] = [];
  allCategories: Category[] = [];
  filteredCategories: Category[] = [];
  tags: Tag[] = [];

  // Estados da tela.
  isLoading = false;
  isCreatingTag = false;
  errorMessage = '';
  isEditMode = false;
  isReadOnly = false;
  transactionId: string | null = null;

  private currentProfileId: string | null = null;
  private destroy$ = new Subject<void>();

  newTagCtrl = new FormControl('');

  transactionForm = new FormGroup({
    type: new FormControl<'INCOME' | 'EXPENSE' | 'TRANSFER'>('EXPENSE', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    date: new FormControl<string>(new Date().toISOString().split('T')[0], { nonNullable: true, validators: [Validators.required] }),
    account_id: new FormControl<string>('', [Validators.required]),
    category_id: new FormControl<string>(''),
    transfer_account_id: new FormControl<string>(''),
    tags: new FormControl<string[]>([]),
    description: new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    status: new FormControl<'PENDING' | 'COMPLETED'>('COMPLETED')
  });

  ngOnInit(): void {
    this.setupEditMode();

    const initialType = this.transactionForm.get('type')?.value || 'EXPENSE';
    this.updateValidationSchema(initialType);

    // Observa o perfil ativo para carregar dependências do formulário.
    this.profileService.currentProfile$
      .pipe(
        takeUntil(this.destroy$),
        filter(profile => !!profile)
      )
      .subscribe(profile => {
        this.currentProfileId = profile!.id;
        this.loadFormData(this.currentProfileId);
      });

    // Recalcula validações e categorias quando o tipo muda.
    this.transactionForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.updateValidationSchema(type);
        this.filterCategoriesByType(type);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Ativa modo edição quando existe id na rota e carrega os dados da transação.
  private setupEditMode(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id');

    if (this.transactionId && this.transactionId !== 'new') {
      this.isEditMode = true;
      this.isReadOnly = true;
      this.transactionForm.disable();

      this.transactionService.getTransactionById(this.transactionId).subscribe({
        next: (txData: TransactionWithDetails) => {
          this.fillFormWithTransaction(txData);

          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching transaction details:', err)
      });
    }
  }

  // Preenche os campos do formulário com os dados de uma transação existente.
  private fillFormWithTransaction(txData: TransactionWithDetails): void {
    this.transactionForm.patchValue({
      type: txData.type,
      amount: txData.amount,
      date: txData.date,
      account_id: txData.account_id,
      category_id: txData.category_id,
      transfer_account_id: txData.transfer_account_id,
      description: txData.description || '',
      status: txData.status || 'COMPLETED'
    });

    if (txData.transaction_tags) {
      const tagIds = txData.transaction_tags.map((tt) => tt.tags.id);
      this.transactionForm.get('tags')?.setValue(tagIds);
    }

    this.updateValidationSchema(txData.type);
    this.filterCategoriesByType(txData.type);
  }

  // Ativa edição de uma transação já existente.
  enableEditing(): void {
    this.isReadOnly = false;
    this.transactionForm.enable();

    this.transactionForm.get('type')?.disable();
  }

  // Remove a transação atual e retorna para a listagem.
  onDelete(): void {
    if (!this.transactionId) return;

    this.confirmModal.confirm({
      title: 'Delete transaction',
      message: 'Are you sure you want to delete this transaction?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.isLoading = true;
        this.transactionService.deleteTransaction(this.transactionId!).subscribe({
          next: () => this.goBack(),
          error: () => {
            this.errorMessage = 'Failed to delete transaction.';
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      });
  }

  // Monta payload da transação a partir do formulário.
  private buildTransactionPayload(): Partial<Transaction> {
    const rawValue = this.transactionForm.getRawValue();

    return {
      type: rawValue.type,
      amount: rawValue.amount ?? 0,
      date: rawValue.date,
      account_id: rawValue.account_id ?? '',
      description: rawValue.description || undefined,
      status: rawValue.status || 'COMPLETED',
      category_id: rawValue.category_id || undefined,
      transfer_account_id: rawValue.transfer_account_id || undefined,
      tags: rawValue.tags || []
    };
  }

  // Cria ou atualiza transação com base no modo atual do formulário.
  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const payload = this.buildTransactionPayload();

    if (this.isEditMode && this.transactionId) {
      this.transactionService.updateTransaction(this.transactionId, payload).subscribe({
        next: () => this.goBack(),
        error: (err) => this.handleError(err)
      });
    } else {
      this.transactionService.createTransaction(payload).subscribe({
        next: () => this.goBack(),
        error: (err) => this.handleError(err)
      });
    }
  }

  // Trata erros de ações de persistência e atualiza feedback da tela.
  private handleError(err: unknown): void {
    this.isLoading = false;

    if (typeof err === 'object' && err !== null && 'error' in err) {
      const errorWrapper = err as { error?: { message?: string } };
      this.errorMessage = errorWrapper.error?.message || 'Action failed.';
    } else {
      this.errorMessage = 'Action failed.';
    }

    this.cdr.markForCheck();
  }

  // Carrega contas, categorias e tags para o perfil selecionado.
  private loadFormData(profileId: string): void {
    forkJoin({
      accounts: this.accountService.getAccounts(profileId),
      categories: this.categoryService.getCategories(profileId),
      tags: this.tagService.getTags(profileId)
    }).subscribe({
      next: (data) => {
        this.accounts = data.accounts;
        this.allCategories = data.categories;
        this.tags = data.tags;
        this.filterCategoriesByType(this.transactionForm.get('type')?.value || 'EXPENSE');
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load form data.';
        this.cdr.markForCheck();
      }
    });
  }

  // Aplica regras de validação conforme o tipo da transação.
  private updateValidationSchema(type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): void {
    const categoryCtrl = this.transactionForm.get('category_id');
    const transferCtrl = this.transactionForm.get('transfer_account_id');

    if (type === 'TRANSFER') {
      categoryCtrl?.clearValidators();
      transferCtrl?.setValidators([Validators.required]);
    } else {
      categoryCtrl?.setValidators([Validators.required]);
      transferCtrl?.clearValidators();
    }

    categoryCtrl?.updateValueAndValidity();
    transferCtrl?.updateValueAndValidity();
  }

  // Filtra categorias exibidas com base no tipo selecionado.
  private filterCategoriesByType(type: string): void {
    if (type === 'TRANSFER') {
      this.filteredCategories = [];
    } else {
      this.filteredCategories = this.allCategories.filter(cat => cat.type === type);
    }
  }

  // Indica se uma tag está selecionada no formulário.
  isTagSelected(tagId: string): boolean {
    return this.transactionForm.get('tags')?.value?.includes(tagId) ?? false;
  }

  // Resolve classes visuais da tag conforme estado de seleção e leitura.
  getTagChipClasses(tagId: string): Record<string, boolean> {
    return {
      'tag-chip-active': this.isTagSelected(tagId),
      'tag-chip-muted': this.isReadOnly && !this.isTagSelected(tagId)
    };
  }

  // Cria uma nova tag e já a associa ao formulário.
  addTag(): void {
    const name = this.newTagCtrl.value?.trim();
    if (!name || !this.currentProfileId) return;

    this.isCreatingTag = true;
    this.tagService.createTag({ name, profile_id: this.currentProfileId }).subscribe({
      next: (newTag) => {
        this.tags = [...this.tags, newTag];
        this.newTagCtrl.reset();
        this.toggleTag(newTag.id);
        this.isCreatingTag = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isCreatingTag = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Remove uma tag e limpa seleção associada no formulário.
  removeTag(tagId: string, event: Event): void {
    event.stopPropagation();

    this.confirmModal.confirm({
      title: 'Delete tag',
      message: 'Are you sure you want to delete this tag?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.tagService.deleteTag(tagId).subscribe({
          next: () => {
            this.tags = this.tags.filter(t => t.id !== tagId);

            const control = this.transactionForm.get('tags');
            const currentSelection = control?.value || [];
            control?.setValue(currentSelection.filter(id => id !== tagId));

            this.cdr.markForCheck();
          }
        });
      });
  }

  // Alterna seleção de tag no formulário (somente em modo editável).
  toggleTag(tagId: string): void {
    if (this.isReadOnly) return;

    const control = this.transactionForm.get('tags');
    const current = control?.value || [];
    const index = current.indexOf(tagId);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(tagId);
    }
    control?.setValue([...current]);
  }

  // Regressa para a listagem de transações.
  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.checkFieldInvalid(this.transactionForm, fieldName);
  }
}
