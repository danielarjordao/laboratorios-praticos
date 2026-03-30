import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  private authService = inject(Auth);

  // Formulário inicializado
  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    password: new FormControl('', [Validators.minLength(6)])
  });

  successMessage = '';
  errorMessage = '';
  isLoading = false;

  // Flag para controlar o estado do formulário
  isReadOnly = true;

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getCurrentUser();

    if (user && user.user_metadata) {
      this.profileForm.patchValue({
        firstName: user.user_metadata['first_name'] || '',
        lastName: user.user_metadata['last_name'] || ''
      });

      // Tranca o formulário no carregamento inicial
      this.profileForm.disable();
    }
  }

  // Método para destrancar o formulário
  enableEditing(): void {
    this.isReadOnly = false;
    this.profileForm.enable();
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Método para cancelar e voltar a trancar
  cancelEditing(): void {
    this.isReadOnly = true;
    this.profileForm.disable();
    this.successMessage = '';
    this.errorMessage = '';

    // Recarrega os dados do utilizador para desfazer alterações
    this.ngOnInit();
  }

  async onSubmit(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Usa getRawValue para garantir que apanha os valores mesmo se houver campos desativados
    const { firstName, lastName, password } = this.profileForm.getRawValue();

    const pwdToUpdate = password ? password : undefined;

    const result = await this.authService.updateProfile(
      firstName as string,
      lastName as string,
      pwdToUpdate
    );

    if (result.success) {
      this.successMessage = 'Profile updated successfully!';
      this.profileForm.get('password')?.reset();

      this.isReadOnly = true;
      this.profileForm.disable();

      // Fetch the fresh data from Supabase and broadcast it to the Header
      const updatedUser = await this.authService.getCurrentUser();
      this.authService.updateUserState(updatedUser);
    } else {
      this.errorMessage = result.error || 'Failed to update profile.';
    }

    this.isLoading = false;
  }
}
