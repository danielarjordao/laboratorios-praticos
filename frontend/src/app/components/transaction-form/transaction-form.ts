import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TransactionService } from '../../services/transaction';
import { AccountService } from '../../services/account';
import { CategoryService } from '../../services/category';
import { TagService } from '../../services/tag';
import { ProfileService } from '../../services/profile';

import { Transaction } from '../../models/transaction';
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
  // Serviços
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  // Dados para dropdowns e seleções
  accounts: Account[] = [];
  allCategories: Category[] = [];
  filteredCategories: Category[] = [];
  tags: Tag[] = [];

  // Estados de UI
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  // Formulário reativo para criação/edição de transações
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
    // Carrega os dados necessários para o formulário (contas, categorias, tags) com base no perfil ativo
    this.profileService.currentProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        if (profile) {
          this.loadFormData(profile.id);
        }
      });

    // Fica à escuta de mudanças no tipo de transação para ajustar a validação e os campos exibidos dinamicamente
    this.transactionForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.updateValidationSchema(type);
        this.filterCategoriesByType(type);
      });
  }

  // Limpa os recursos e subscrições quando o componente é destruído
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFormData(profileId: string) {
    // Carrega as contas associadas ao perfil ativo para popular o dropdown de seleção de conta
    this.accountService.getAccounts(profileId).subscribe(data => this.accounts = data);

    // Carrega as categorias associadas ao perfil ativo para popular o dropdown de seleção de categoria, filtrando posteriormente pelo tipo de transação
    this.categoryService.getCategories(profileId).subscribe(data => {
      this.allCategories = data;
      this.filterCategoriesByType(this.transactionForm.get('type')?.value || 'EXPENSE');
    });

    // Carrega as tags associadas ao perfil ativo para permitir a seleção de tags na
    this.tagService.getTags(profileId).subscribe(data => this.tags = data);
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
    // Filtra as categorias para exibir apenas as relevantes ao tipo de transação selecionado (INCOME ou EXPENSE). Para TRANSFER, não exibe categorias.
    if (type === 'TRANSFER') {
      this.filteredCategories = [];
    } else {
      this.filteredCategories = this.allCategories.filter(cat => cat.type === type);
    }
  }

onSubmit() {
  if (this.transactionForm.invalid) {
    this.transactionForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  const rawValue = this.transactionForm.getRawValue();

  // Mapeamento manual para garantir compatibilidade total de tipos
  const data: Partial<Transaction> = {
    type: rawValue.type,
    amount: rawValue.amount || 0,
    date: rawValue.date,
    account_id: rawValue.account_id || '',
    description: rawValue.description || '',
    status: rawValue.status || 'COMPLETED',

    // Campos que podem ser null no formulário mas o Model quer string/undefined
    category_id: rawValue.category_id || undefined,
    transfer_account_id: rawValue.transfer_account_id || undefined,

    // Se o teu backend espera apenas os IDs das tags:
    tags: rawValue.tags ? rawValue.tags.map(tagId => ({ name: tagId })) : []
  };

  this.transactionService.createTransaction(data).subscribe({
    next: () => this.goBack(),
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = err.error?.message || 'Failed to save transaction.';
    }
  });
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
