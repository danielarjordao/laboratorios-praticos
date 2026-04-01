import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, finalize, take, takeUntil } from 'rxjs';
import { ProfileService } from '../../services/profile';
import { Auth } from '../../services/auth';
import { Profile } from '../../models/profile';
import { LoadingIndicator } from '../../resources/loading-indicator/loading-indicator';
import { ConfirmModalService } from '../../services/confirm-modal';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingIndicator],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profiles implements OnInit, OnDestroy {
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(Auth);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly destroy$ = new Subject<void>();

  // Estado dos Dados
  profiles: Profile[] = [];
  activeProfileId: string | undefined;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Estado do Modal
  isModalOpen = false;
  isEditMode = false;
  currentProfileId: string | null = null;

  // Formulário Reativo
  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  ngOnInit(): void {
    this.subscribeToProfiles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Ouve o estado global dos perfis (já gerido pelo teu ProfileService)
  private subscribeToProfiles(): void {
    this.isLoading = true;

    this.profileService.allProfiles$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profiles) => {
          this.profiles = profiles;
          this.errorMessage = '';
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Falha ao carregar perfis:', err);
          this.errorMessage = 'Failed to load profiles.';
          this.isLoading = false;
        }
      });

    this.profileService.currentProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.activeProfileId = profile?.id;
      });
  }

  // Gestão do Modal
  openModal(profile?: Profile): void {
    this.isModalOpen = true;

    if (profile) {
      this.isEditMode = true;
      this.currentProfileId = profile.id;
      this.profileForm.patchValue({
        name: profile.name
      });
    } else {
      this.isEditMode = false;
      this.currentProfileId = null;
      this.profileForm.reset();
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.profileForm.reset();
  }

  // Operações CRUD
  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.getRawValue();
    const profileName = (formValue.name || '').trim();

    if (!profileName) {
      this.profileForm.controls.name.setErrors({ required: true });
      return;
    }

    // Assume que tens o current user no Auth service para associar ao criar
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser && !this.isEditMode) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isEditMode && this.currentProfileId) {
      this.profileService.updateProfile(this.currentProfileId, { name: profileName })
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: () => this.closeModal(),
          error: (err) => {
            console.error('Erro ao atualizar perfil:', err);
            this.errorMessage = 'Failed to update profile.';
          }
        });
    } else {
      this.profileService.createProfile({ name: profileName, user_id: currentUser!.id })
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: () => this.closeModal(),
          error: (err) => {
            console.error('Erro ao criar perfil:', err);
            this.errorMessage = 'Failed to create profile.';
          }
        });
    }
  }

  onDelete(id: string, event: Event): void {
    event.stopPropagation();

    if (this.profiles.length === 1) {
      alert('Não podes eliminar o teu último perfil.');
      return;
    }

    this.confirmModal.confirm({
      title: 'Eliminar perfil',
      message: 'Tem a certeza que deseja eliminar este perfil e todos os dados associados?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDestructive: true,
    })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.profileService.deleteProfile(id).subscribe({
          next: () => {
            // Se apagou o perfil ativo, muda para outro automaticamente
            if (this.activeProfileId === id && this.profiles.length > 0) {
              const nextProfile = this.profiles.find(p => p.id !== id);
              if (nextProfile) this.profileService.switchProfile(nextProfile);
            }
          },
          error: (err) => console.error('Erro ao eliminar perfil:', err)
        });
      });
  }

  // Define o perfil clicado como ativo (igual ao Header)
  setActiveProfile(profile: Profile): void {
    if (this.activeProfileId !== profile.id) {
      this.profileService.switchProfile(profile);
    }
  }
}
