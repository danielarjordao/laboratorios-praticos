import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { checkFieldInvalid } from '../../utils/formUtils';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../services/auth';

type UserInfoForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-info.html',
  styleUrls: ['./user-info.css'],
})
export class UserInfo implements OnInit, OnDestroy {
  private readonly authService = inject(Auth);
  private readonly checkFieldInvalid = checkFieldInvalid;
  private readonly destroy$ = new Subject<void>();

  // Formulario principal das informacoes do usuario.
  userInfoForm: UserInfoForm = this.createUserInfoForm();

  successMessage = '';
  errorMessage = '';
  isLoading = false;
  isReadOnly = true;

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (!user) {
          return;
        }

        this.applyUserData(user.firstName, user.lastName);
        this.applyCurrentFormMode();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Ativa o modo de edicao.
  enableEditing(): void {
    this.isReadOnly = false;
    this.applyCurrentFormMode();
    this.clearMessages();
  }

  // Volta para leitura e limpa mensagens.
  cancelEditing(): void {
    this.isReadOnly = true;
    this.applyCurrentFormMode();
    this.clearMessages();
  }

  // Envia alteracoes para o servico de autenticacao.
  async onSubmit(): Promise<void> {
    if (!this.canSubmitUserInfo()) {
      return;
    }

    this.startLoading();
    const payload = this.getSubmitPayload();

    if (!payload) {
      this.finishLoading();
      return;
    }

    try {
      const result = await this.authService.updateProfile(
        payload.firstName,
        payload.lastName,
        payload.password,
      );

      if (result.success) {
        this.handleSuccessfulUpdate();
        return;
      }

      this.errorMessage = result.error || 'Failed to update user info.';
    } catch (err: unknown) {
      this.errorMessage = 'An unexpected error occurred.';
      console.error('User info update error:', err);
    } finally {
      this.finishLoading();
    }
  }

  // Cria o formulario com validacoes padrao.
  private createUserInfoForm(): UserInfoForm {
    return new FormGroup({
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.minLength(6)],
      }),
    });
  }

  // Sincroniza dados vindos do usuario autenticado.
  private applyUserData(firstName?: string, lastName?: string): void {
    this.userInfoForm.patchValue({
      firstName: firstName || '',
      lastName: lastName || '',
    });
  }

  // Aplica estado de leitura ou edicao no formulario.
  private applyCurrentFormMode(): void {
    if (this.isReadOnly) {
      this.userInfoForm.disable();
      return;
    }

    this.userInfoForm.enable();
  }

  // Limpa mensagens exibidas na tela.
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Verifica se envio pode continuar.
  private canSubmitUserInfo(): boolean {
    if (this.userInfoForm.invalid) {
      this.userInfoForm.markAllAsTouched();
      return false;
    }

    return true;
  }

  // Inicia estado de carregamento.
  private startLoading(): void {
    this.isLoading = true;
    this.clearMessages();
  }

  // Finaliza estado de carregamento.
  private finishLoading(): void {
    this.isLoading = false;
  }

  // Prepara payload para envio mantendo senha opcional.
  private getSubmitPayload(): { firstName: string; lastName: string; password?: string } | null {
    const { firstName, lastName, password } = this.userInfoForm.getRawValue();

    if (!firstName || !lastName) {
      this.errorMessage = 'First name and last name are required.';
      return null;
    }

    const trimmedPassword = password.trim();

    return {
      firstName,
      lastName,
      password: trimmedPassword ? trimmedPassword : undefined,
    };
  }

  // Atualiza UI apos sucesso da operacao.
  private handleSuccessfulUpdate(): void {
    this.successMessage = 'User info updated successfully!';
    this.userInfoForm.controls.password.reset('');
    this.isReadOnly = true;
    this.applyCurrentFormMode();
  }

  // Verifica se um campo do formulario e invalido para exibir feedback visual.
  isFieldInvalid(fieldName: string): boolean {
    return this.checkFieldInvalid(this.userInfoForm, fieldName);
  }
}
