import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Subject, takeUntil } from 'rxjs';

type ProfileForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit, OnDestroy {
  private authService = inject(Auth);
  private destroy$ = new Subject<void>();

  // Formulario principal do perfil.
  profileForm: ProfileForm = this.createProfileForm();

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

  // Envia alteracoes do perfil para o Auth.
  async onSubmit(): Promise<void> {
    if (!this.canSubmitProfile()) {
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

      this.errorMessage = result.error || 'Failed to update profile.';
    } catch (err: unknown) {
      this.errorMessage = 'An unexpected error occurred.';
      console.error('Profile update error:', err);
    } finally {
      this.finishLoading();
    }
  }

  // Cria o formulario com validacoes padrao.
  private createProfileForm(): ProfileForm {
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

  // Sincroniza os dados vindos do usuario autenticado.
  private applyUserData(firstName?: string, lastName?: string): void {
    this.profileForm.patchValue({
      firstName: firstName || '',
      lastName: lastName || '',
    });
  }

  // Aplica o estado de leitura/edicao no formulario.
  private applyCurrentFormMode(): void {
    if (this.isReadOnly) {
      this.profileForm.disable();
      return;
    }

    this.profileForm.enable();
  }

  // Limpa mensagens exibidas na tela.
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Verifica se o envio pode continuar.
  private canSubmitProfile(): boolean {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return false;
    }

    return true;
  }

  // Inicia estado de carregamento da submissao.
  private startLoading(): void {
    this.isLoading = true;
    this.clearMessages();
  }

  // Finaliza estado de carregamento da submissao.
  private finishLoading(): void {
    this.isLoading = false;
  }

  // Prepara dados para envio mantendo senha opcional.
  private getSubmitPayload(): { firstName: string; lastName: string; password?: string } | null {
    const { firstName, lastName, password } = this.profileForm.getRawValue();

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
    this.successMessage = 'Profile updated successfully!';
    this.profileForm.controls.password.reset('');
    this.isReadOnly = true;
    this.applyCurrentFormMode();
  }
}
