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

  // Initialize the form
  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    // Password is not required for update, only validated if the user types something
    password: new FormControl('', [Validators.minLength(6)])
  });

  successMessage = '';
  errorMessage = '';
  isLoading = false;

  async ngOnInit(): Promise<void> {
    // Load current user data and patch the form
    const user = await this.authService.getCurrentUser();

    if (user && user.user_metadata) {
      this.profileForm.patchValue({
        firstName: user.user_metadata['first_name'] || '',
        lastName: user.user_metadata['last_name'] || ''
      });
    }
  }

  async onSubmit(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { firstName, lastName, password } = this.profileForm.getRawValue();

    // Only send the password to the update function if the field is not empty
    const pwdToUpdate = password ? password : undefined;

    const result = await this.authService.updateProfile(
      firstName as string,
      lastName as string,
      pwdToUpdate
    );

    if (result.success) {
      this.successMessage = 'Profile updated successfully!';
      this.profileForm.get('password')?.reset(); // Clear the password field for security
    } else {
      this.errorMessage = result.error || 'Failed to update profile.';
    }

    this.isLoading = false;
  }
}
