import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Logo } from '../../resources/logo/logo';
import { Footer } from '../../resources/footer/footer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Logo, Footer],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  private router = inject(Router);
  private authService = inject(Auth);

  isRegistering = false;
  errorMessage = '';
  isDarkMode = false;

  // Instanciação direta do formulário
  loginForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ])
  });

  ngOnInit(): void {
    this.isDarkMode = document.body.classList.contains('dark-theme');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    // Adiciona ou remove a classe 'dark' no body, que ativa as tuas variáveis do Figma
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  // Método auxiliar para classes de erro no HTML
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';

    // Reset ao formulário ao trocar de modo
    this.loginForm.reset();

    const firstNameCtrl = this.loginForm.get('firstName');
    const lastNameCtrl = this.loginForm.get('lastName');

    if (this.isRegistering) {
      firstNameCtrl?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
      lastNameCtrl?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
    } else {
      firstNameCtrl?.clearValidators();
      lastNameCtrl?.clearValidators();
    }

    firstNameCtrl?.updateValueAndValidity();
    lastNameCtrl?.updateValueAndValidity();
  }

async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, firstName, lastName } = this.loginForm.getRawValue();

    if (this.isRegistering) {
      const result = await this.authService.signUp(email as string, password as string, firstName as string, lastName as string);
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = result.error || 'Erro ao registar.';
      }
    } else {
      const result = await this.authService.signIn(email as string, password as string);
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = result.error || 'Email ou password inválidos.';
      }
    }
  }
}
