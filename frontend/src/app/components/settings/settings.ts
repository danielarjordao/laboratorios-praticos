import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import { SettingsService } from '../../services/settings';
import { Auth } from '../../services/auth';
import { UserSettings } from '../../models/settings';
import { PreferencesService } from '../../services/preferences';
import { LoadingIndicator } from '../../resources/loading-indicator/loading-indicator';

type SettingsForm = FormGroup<{
  theme: FormControl<'light' | 'dark' | 'system'>;
  currency: FormControl<string>;
  language: FormControl<string>;
  receive_notifications: FormControl<boolean>;
}>;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingIndicator],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit, OnDestroy {
  private readonly settingsService = inject(SettingsService);
  private readonly authService = inject(Auth);
  private readonly preferences = inject(PreferencesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly location = inject(Location);

  isLoading = true;
  isSaving = false;
  hasExistingSettings = false;
  errorMessage = '';
  successMessage = '';

  // Estado do usuário e settings para controle de carregamento e criação/atualização.
  private currentUserId: string | null = null;
  private loadedSettingsUserId: string | null = null;
  settingsForm: SettingsForm = this.createSettingsForm();

  // Sincroniza o tema do formulário com as preferências globais para refletir mudanças feitas no Header.
  ngOnInit(): void {
    this.subscribeToDynamicSettingsPreview();

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUserId = user?.id || null;

        if (!this.currentUserId) {
          this.loadedSettingsUserId = null;
          this.hasExistingSettings = false;
          this.isLoading = false;
          this.errorMessage = 'Sign in to manage your preferences.';
          this.cdr.detectChanges();
          return;
        }

        if (this.loadedSettingsUserId === this.currentUserId) {
          return;
        }

        this.loadedSettingsUserId = this.currentUserId;
        this.loadSettings(this.currentUserId);
      });
  }

  // Mantem o seletor de tema sincronizado quando o Header altera tema global.
  @HostListener('document:app-theme-changed')
  onThemeChanged(): void {
    this.settingsForm.controls.theme.setValue(this.preferences.current.theme, { emitEvent: false });
    this.cdr.detectChanges();
  }

  // Limpa as subscrições para evitar memory leaks.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cria formulario tipado com valores padrao.
  private createSettingsForm(): SettingsForm {
    return new FormGroup({
      theme: new FormControl<'light' | 'dark' | 'system'>('light', { nonNullable: true, validators: [Validators.required] }),
      currency: new FormControl('EUR', { nonNullable: true, validators: [Validators.required] }),
      language: new FormControl({ value: 'pt-PT', disabled: true }, { nonNullable: true }),
      receive_notifications: new FormControl({ value: true, disabled: true }, { nonNullable: true }),
    });
  }

  // Carrega settings do utilizador autenticado.
  private loadSettings(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.settingsService.getUserSettings(userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: settings => {
          this.hasExistingSettings = true;
          this.applySettings(settings);
          this.preferences.applyFromSettings(settings.theme, settings.currency, settings.language);
        },
        error: err => {
          console.warn('Settings not found. Creating initial preferences on first save.', err);
          this.hasExistingSettings = false;
          this.settingsForm.reset({
            theme: 'light',
            currency: 'EUR',
            language: 'pt-PT',
            receive_notifications: true,
          });
          this.preferences.applyFromSettings('light', 'EUR', 'pt-PT');
        },
      });
  }

  // Aplica preview dinamico ao alterar campos do formulario.
  private subscribeToDynamicSettingsPreview(): void {
    this.settingsForm.controls.theme.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.preferences.setTheme(theme);
        this.settingsForm.controls.theme.setValue(this.preferences.current.theme, { emitEvent: false });
      });

    this.settingsForm.controls.currency.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(currency => {
        this.preferences.setCurrency(currency);
        this.settingsForm.controls.language.setValue(this.preferences.current.locale, { emitEvent: false });
      });
  }

  // Aplica valores de settings no formulario.
  private applySettings(settings: UserSettings): void {
    this.settingsForm.patchValue({
      theme: settings.theme,
      currency: settings.currency,
      language: settings.language,
      receive_notifications: settings.receive_notifications,
    });

    this.settingsForm.controls.language.disable({ emitEvent: false });
    this.settingsForm.controls.receive_notifications.disable({ emitEvent: false });
  }

  // Persiste criacao ou atualizacao dos settings.
  onSubmit(): void {
    if (this.settingsForm.invalid || this.isSaving) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    if (!this.currentUserId) {
      this.errorMessage = 'Sign in to save preferences.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.settingsForm.getRawValue();
    const settingsPayload: Partial<UserSettings> = {
      user_id: this.currentUserId,
      theme: formValue.theme,
      currency: formValue.currency,
      language: formValue.language,
      receive_notifications: formValue.receive_notifications,
    };

    const request$ = this.hasExistingSettings
      ? this.settingsService.updateUserSettings(this.currentUserId, settingsPayload)
      : this.settingsService.createUserSettings(settingsPayload);

    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
      next: () => {
        this.hasExistingSettings = true;
        this.successMessage = 'Preferences saved successfully.';
        this.preferences.applyFromSettings(formValue.theme, formValue.currency, this.preferences.current.locale);
        this.settingsForm.controls.language.setValue(this.preferences.current.locale, { emitEvent: false });
      },
      error: err => {
        console.error('Failed to save settings:', err);
        this.errorMessage = 'Failed to save preferences.';
      }
    });
  }

  // Navega de volta para a página anterior.
  goBack(): void {
    this.location.back();
  }
}
