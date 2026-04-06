import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Footer } from '../../resources/footer/footer';
import { Logo } from '../../resources/logo/logo';
import { PreferencesService } from '../../services/preferences';

type LoginForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Logo, Footer],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);
  private readonly preferences = inject(PreferencesService);
  private readonly cdr = inject(ChangeDetectorRef);

  isRegistering = false;
  errorMessage = '';
  isDarkMode = false;
  isLoading = false;

  // Formulario de autenticacao.
  loginForm: LoginForm = this.createLoginForm();

  // Sincroniza o tema visual com as preferencias do usuario e aplica validacoes de formulario.
  ngOnInit(): void {
    const currentTheme = this.preferences.current.theme;
    // Aplica o tema visual atual.
    this.isDarkMode = currentTheme === 'dark' ||
                     (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.applyRegisterValidators();
  }

  // Alterna o tema visual da pagina.
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    this.preferences.setTheme(this.isDarkMode ? 'dark' : 'light');
  }

  // Informa se o campo deve exibir erro.
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Alterna entre login e cadastro.
  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    this.isLoading = false;
    this.loginForm.reset();
    this.applyRegisterValidators();
  }

  // Envia credenciais para login ou cadastro.
  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.canSubmit()) {
      return;
    }

    this.isLoading = true;

    try {
      if (this.isRegistering) {
        await this.submitRegister();
        return;
      }

      await this.submitLogin();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Cria o formulario com validacoes padrao.
  private createLoginForm(): LoginForm {
    return new FormGroup({
      firstName: new FormControl('', { nonNullable: true }),
      lastName: new FormControl('', { nonNullable: true }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
    });
  }

  // Aplica validacoes de nome no modo cadastro.
  private applyRegisterValidators(): void {
    const firstNameCtrl = this.loginForm.controls.firstName;
    const lastNameCtrl = this.loginForm.controls.lastName;

    if (this.isRegistering) {
      firstNameCtrl.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
      lastNameCtrl.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
    } else {
      firstNameCtrl.clearValidators();
      lastNameCtrl.clearValidators();
    }

    firstNameCtrl.updateValueAndValidity();
    lastNameCtrl.updateValueAndValidity();
  }

  // Garante estado valido antes de chamar API.
  private canSubmit(): boolean {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return false;
    }

    return true;
  }

  // Processa o fluxo de cadastro.
  private async submitRegister(): Promise<void> {
    const { email, password, firstName, lastName } = this.loginForm.getRawValue();

    const result = await this.authService.signUp(email, password, firstName, lastName);
    if (result.success) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.errorMessage = result.error || 'Registration failed.';
  }

  // Processa o fluxo de login.
  private async submitLogin(): Promise<void> {
    const { email, password } = this.loginForm.getRawValue();

    const result = await this.authService.signIn(email, password);
    if (result.success) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.errorMessage = result.error || 'Invalid email or password.';
  }
}
