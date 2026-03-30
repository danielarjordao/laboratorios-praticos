import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit, OnDestroy {
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Reactive form for user profile editing
  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    password: new FormControl('', [Validators.minLength(6)])
  });

  successMessage = '';
  errorMessage = '';
  isLoading = false;
  isReadOnly = true;

  ngOnInit(): void {
    // Listens to auth changes to fill the form with current data
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.profileForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || ''
          });

          if (this.isReadOnly) {
            this.profileForm.disable();
          }

          this.cdr.markForCheck(); // Soft UI update
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Unlocks the form for editing
  enableEditing(): void {
    this.isReadOnly = false;
    this.profileForm.enable();
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Locks the form and discards unsaved changes
  cancelEditing(): void {
    this.isReadOnly = true;
    this.profileForm.disable();
    this.successMessage = '';
    this.errorMessage = '';

    // Values will be naturally reset by the currentUser$ subscription
  }

  /**
   * Handles profile update submission to the Auth service
   */
  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { firstName, lastName, password } = this.profileForm.getRawValue();

    try {
      const result = await this.authService.updateProfile(
        firstName as string,
        lastName as string,
        password || undefined
      );

      if (result.success) {
        this.successMessage = 'Profile updated successfully!';
        this.profileForm.get('password')?.reset();
        this.isReadOnly = true;
        this.profileForm.disable();
      } else {
        this.errorMessage = result.error || 'Failed to update profile.';
      }
    } catch (err) {
      this.errorMessage = 'An unexpected error occurred.';
      console.error('Profile update error:', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck(); // Important: signal UI to reflect loading/message state changes
    }
  }
}
