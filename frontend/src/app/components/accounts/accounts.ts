import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, finalize, take, takeUntil } from 'rxjs';
import { AccountService } from '../../services/account';
import { Account } from '../../models/account';
import { ProfileService } from '../../services/profile';
import { PreferencesService } from '../../services/preferences';
import { LoadingIndicator } from '../../resources/loading-indicator/loading-indicator';
import { ConfirmModalService } from '../../services/confirm-modal';
import { checkFieldInvalid } from '../../utils/formUtils';

type AccountForm = FormGroup<{
  name: FormControl<string>;
  type: FormControl<string>;
  balance: FormControl<number>;
}>;

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingIndicator],
  templateUrl: './accounts.html',
  styleUrls: ['./accounts.css']
})
export class Accounts implements OnInit, OnDestroy {
  private readonly accountService = inject(AccountService);
  private readonly profileService = inject(ProfileService);
  private readonly preferences = inject(PreferencesService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly checkFieldInvalid = checkFieldInvalid;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  // Estado de dados.
  accounts: Account[] = [];
  activeProfileId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Estado do modal.
  isModalOpen = false;
  isEditMode = false;
  currentAccountId: string | null = null;

  // Formulario de conta.
  accountForm: AccountForm = this.createAccountForm();

  ngOnInit(): void {
    this.preferences.preferences$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });

    this.profileService.currentProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.activeProfileId = profile?.id || null;

        if (!this.activeProfileId) {
          this.accounts = [];
          this.errorMessage = 'Select a profile to load accounts.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.errorMessage = '';
        this.loadAccounts();
        this.cdr.detectChanges();
      });
  }

  // Formata saldo com locale e moeda ativos.
  formatCurrency(value: number | null | undefined): string {
    return this.preferences.formatCurrency(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cria formulario com valores padrao.
  private createAccountForm(): AccountForm {
    return new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
      type: new FormControl('CHECKING', { nonNullable: true, validators: [Validators.required] }),
      balance: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    });
  }

  // Carrega contas do perfil ativo.
  loadAccounts(): void {
    if (!this.activeProfileId) {
      this.accounts = [];
      this.errorMessage = 'Select a profile to load accounts.';
      return;
    }

    this.isLoading = true;
    this.accountService.getAccounts(this.activeProfileId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
      next: data => {
        this.accounts = data;
        this.cdr.detectChanges();
      },
      error: err => {
        this.errorMessage = 'Failed to load accounts.';
        console.error('Failed to load accounts:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // Abre modal em modo criar ou editar.
  openModal(account?: Account): void {
    if (!this.activeProfileId) {
      this.errorMessage = 'Select a profile before managing accounts.';
      return;
    }

    this.isModalOpen = true;

    if (account) {
      this.isEditMode = true;
      this.currentAccountId = account.id;
      this.accountForm.patchValue({
        name: account.name,
        type: account.type || 'CHECKING',
        balance: account.balance || 0,
      });
    } else {
      this.isEditMode = false;
      this.currentAccountId = null;
      this.resetForm();
    }
  }

  // Fecha modal e limpa estado temporario.
  closeModal(): void {
    this.isModalOpen = false;
    this.currentAccountId = null;
    this.isEditMode = false;
    this.resetForm();
  }

  // Restaura valores padrao do formulario.
  private resetForm(): void {
    this.accountForm.reset({
      name: '',
      type: 'CHECKING',
      balance: 0,
    });
  }

  // Cria ou atualiza conta.
  onSubmit(): void {
    if (!this.activeProfileId) {
      this.errorMessage = 'Select a profile before saving accounts.';
      return;
    }

    if (this.accountForm.invalid || this.isSubmitting) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const formValue = this.accountForm.getRawValue();
    const accountData: Partial<Account> = {
      name: formValue.name,
      type: formValue.type,
      balance: Number(formValue.balance),
      profile_id: this.activeProfileId,
    };

    const request$ = this.isEditMode && this.currentAccountId
      ? this.accountService.updateAccount(this.currentAccountId, accountData)
      : this.accountService.createAccount(accountData);

    this.isSubmitting = true;
    this.errorMessage = '';

    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
      next: () => {
        this.loadAccounts();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: err => {
        this.errorMessage = 'Failed to save account.';
        console.error('Failed to save account:', err);
        this.cdr.detectChanges();
      },
    });
  }

  // Remove conta apos confirmacao.
  onDelete(id: string, event: Event): void {
    event.stopPropagation();

    this.confirmModal.confirm({
      title: 'Delete account',
      message: 'Are you sure you want to delete this account?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.accountService.deleteAccount(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
          next: () => this.loadAccounts(),
          error: err => {
            this.errorMessage = 'Failed to delete account.';
            console.error('Failed to delete account:', err);
            this.cdr.detectChanges();
          },
        });
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.checkFieldInvalid(this.accountForm, fieldName);
  }
}
