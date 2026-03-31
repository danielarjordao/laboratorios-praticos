import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin, filter } from 'rxjs';

import { TransactionService } from '../../services/transaction';
import { AccountService } from '../../services/account';
import { CategoryService } from '../../services/category';
import { TagService } from '../../services/tag';
import { ProfileService } from '../../services/profile';

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
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Para capturar o ID da rota
  private cdr = inject(ChangeDetectorRef);

  accounts: Account[] = [];
  allCategories: Category[] = [];
  filteredCategories: Category[] = [];
  tags: Tag[] = [];

  // --- Estados do CRUD ---
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
    description: new FormControl<string>(''),
    status: new FormControl<'PENDING' | 'COMPLETED'>('COMPLETED')
  });

  ngOnInit() {
    this.checkIfEditMode();

    this.profileService.currentProfile$
      .pipe(
        takeUntil(this.destroy$),
        filter(profile => !!profile)
      )
      .subscribe(profile => {
        this.currentProfileId = profile!.id;
        this.loadFormData(this.currentProfileId);
      });

    this.transactionForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.updateValidationSchema(type);
        this.filterCategoriesByType(type);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- LÓGICA DO CRUD ---

  checkIfEditMode() {
    this.transactionId = this.route.snapshot.paramMap.get('id');

    if (this.transactionId && this.transactionId !== 'new') {
      this.isEditMode = true;
      this.isReadOnly = true;
      this.transactionForm.disable();

      this.transactionService.getTransactionById(this.transactionId).subscribe({
        next: (txData: TransactionWithDetails) => {

          // O input date aceita o formato YYYY-MM-DD que já vem do teu backend
          const formattedDate = txData.date;

          this.transactionForm.patchValue({
            type: txData.type,
            amount: txData.amount,
            date: formattedDate,
            account_id: txData.account_id,
            category_id: txData.category_id,
            transfer_account_id: txData.transfer_account_id,
            description: txData.description || '',
            status: txData.status || 'COMPLETED'
          });

          // Tratamento das Tags
          if (txData.transaction_tags) {
            const tagIds = txData.transaction_tags.map((tt) => tt.tags.id);
            this.transactionForm.get('tags')?.setValue(tagIds);
          }

          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching transaction details:', err)
      });
    }
  }

  enableEditing() {
    this.isReadOnly = false;
    this.transactionForm.enable();
  }

  onDelete() {
    if (!this.transactionId) return;

    // Substitui pelo teu ModalService se quiseres manter o padrão do teu outro projeto!
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.isLoading = true;
      this.transactionService.deleteTransaction(this.transactionId).subscribe({
        next: () => this.goBack(),
        error: (err) => {
          this.errorMessage = 'Failed to delete transaction.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  onSubmit() {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const rawValue = this.transactionForm.getRawValue();

    // 1. Criamos o corpo da transação respeitando a interface Transaction
    // Usamos o operador '|| undefined' para converter nulls em undefined
    const transactionData: Partial<Transaction> = {
      type: rawValue.type,
      amount: rawValue.amount ?? 0,
      date: rawValue.date,
      account_id: rawValue.account_id ?? '',
      description: rawValue.description || undefined,
      status: rawValue.status || 'COMPLETED',
      category_id: rawValue.category_id || undefined,
      transfer_account_id: rawValue.transfer_account_id || undefined,
    };

    // 2. Criamos um "Payload" que estende a Transaction para incluir as tags
    // que o Backend vai processar separadamente
    const payload = {
      ...transactionData,
      tags: rawValue.tags || []
    };

    if (this.isEditMode && this.transactionId) {
      this.transactionService.updateTransaction(this.transactionId, payload as Transaction).subscribe({
        next: () => this.goBack(),
        error: (err) => this.handleError(err)
      });
    } else {
      this.transactionService.createTransaction(payload as Transaction).subscribe({
        next: () => this.goBack(),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any) {
    this.isLoading = false;
    this.errorMessage = err.error?.message || 'Action failed.';
    this.cdr.markForCheck();
  }

  // --- GESTÃO DE DADOS (Mantém a lógica intacta) ---

  private loadFormData(profileId: string) {
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
      }
    });
  }

  private updateValidationSchema(type: 'INCOME' | 'EXPENSE' | 'TRANSFER') {
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

  private filterCategoriesByType(type: string) {
    if (type === 'TRANSFER') {
      this.filteredCategories = [];
    } else {
      this.filteredCategories = this.allCategories.filter(cat => cat.type === type);
    }
  }

  // --- LÓGICA DE GESTÃO DE TAGS DIRETA NO FORMULÁRIO ---

  addTag() {
    const name = this.newTagCtrl.value?.trim();
    if (!name || !this.currentProfileId) return;

    this.isCreatingTag = true;
    this.tagService.createTag({ name, profile_id: this.currentProfileId }).subscribe({
      next: (newTag) => {
        this.tags = [...this.tags, newTag]; // Atualiza a lista visual
        this.newTagCtrl.reset();
        this.toggleTag(newTag.id); // Seleciona automaticamente a tag acabada de criar
        this.isCreatingTag = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isCreatingTag = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeTag(tagId: string, event: Event) {
    event.stopPropagation(); // Evita que o click ative a seleção da tag ao mesmo tempo

    if (confirm('Are you sure you want to delete this tag?')) {
      this.tagService.deleteTag(tagId).subscribe({
        next: () => {
          // Remove da lista de tags disponíveis
          this.tags = this.tags.filter(t => t.id !== tagId);

          // Remove do formulário caso estivesse selecionada
          const control = this.transactionForm.get('tags');
          const currentSelection = control?.value || [];
          control?.setValue(currentSelection.filter(id => id !== tagId));

          this.cdr.markForCheck();
        }
      });
    }
  }

  toggleTag(tagId: string) {
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

  goBack() {
    this.router.navigate(['/transactions']);
  }
}
