import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, finalize, take, takeUntil } from 'rxjs';
import { CategoryService } from '../../services/category';
import { Category } from '../../models/category';
import { ProfileService } from '../../services/profile';
import { LoadingIndicator } from '../../resources/loading-indicator/loading-indicator';
import { ConfirmModalService } from '../../services/confirm-modal';
import { checkFieldInvalid } from '../../utils/formUtils';

type CategoryForm = FormGroup<{
  name: FormControl<string>;
  type: FormControl<'INCOME' | 'EXPENSE'>;
  icon: FormControl<string>;
  color: FormControl<string>;
}>;

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingIndicator],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class Categories implements OnInit, OnDestroy {
  private readonly categoryService = inject(CategoryService);
  private readonly profileService = inject(ProfileService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly checkFieldInvalid = checkFieldInvalid;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  // Estado de dados.
  categories: Category[] = [];
  activeProfileId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Estado do modal.
  isModalOpen = false;
  isEditMode = false;
  currentCategoryId: string | null = null;

  // Lista de icones disponiveis.
  availableIcons = [
    'shopping_cart', 'restaurant', 'home', 'directions_car',
    'bolt', 'fitness_center', 'school', 'local_hospital',
    'airplane_ticket', 'subscriptions', 'pets', 'work',
    'payments', 'account_balance'
  ];

  // Formulario de categoria.
  categoryForm: CategoryForm = this.createCategoryForm();

  ngOnInit(): void {
    this.profileService.currentProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.activeProfileId = profile?.id || null;

        if (!this.activeProfileId) {
          this.categories = [];
          this.errorMessage = 'Select a profile to load categories.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.errorMessage = '';
        this.loadCategories();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Carrega categorias do perfil ativo.
  loadCategories(): void {
    if (!this.activeProfileId) {
      this.categories = [];
      this.errorMessage = 'Select a profile to load categories.';
      return;
    }

    this.isLoading = true;
    this.categoryService.getCategories(this.activeProfileId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
      next: data => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: err => {
        this.errorMessage = 'Failed to load categories.';
        console.error('Failed to load categories:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // Cria formulario com valores iniciais.
  private createCategoryForm(): CategoryForm {
    return new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
      type: new FormControl<'INCOME' | 'EXPENSE'>('EXPENSE', { nonNullable: true, validators: [Validators.required] }),
      icon: new FormControl('category', { nonNullable: true, validators: [Validators.required] }),
      color: new FormControl('#3b82f6', { nonNullable: true, validators: [Validators.required] }),
    });
  }

  // Abre modal em modo criar ou editar.
  openModal(category?: Category): void {
    if (!this.activeProfileId) {
      this.errorMessage = 'Select a profile before managing categories.';
      return;
    }

    this.isModalOpen = true;

    if (category) {
      this.isEditMode = true;
      this.currentCategoryId = category.id;
      this.categoryForm.patchValue({
        name: category.name,
        type: category.type,
        icon: category.icon || 'category',
        color: category.color || '#3b82f6',
      });
      return;
    }

    this.isEditMode = false;
    this.currentCategoryId = null;
    this.resetForm();
  }

  // Fecha modal e limpa estado temporario.
  closeModal(): void {
    this.isModalOpen = false;
    this.currentCategoryId = null;
    this.isEditMode = false;
    this.resetForm();
  }

  // Restaura valores padrao do formulario.
  private resetForm(): void {
    this.categoryForm.reset({
      name: '',
      type: 'EXPENSE',
      icon: 'category',
      color: '#3b82f6',
    });
  }

  // Seleciona o icone desejado.
  selectIcon(iconName: string): void {
    this.categoryForm.patchValue({ icon: iconName });
  }

  // Envia criacao/atualizacao para a API.
  onSubmit(): void {
    if (!this.activeProfileId) {
      this.errorMessage = 'Select a profile before saving categories.';
      return;
    }

    if (this.categoryForm.invalid || this.isSubmitting) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.categoryForm.getRawValue();
    const categoryData: Partial<Category> = {
      name: formValue.name,
      type: formValue.type,
      icon: formValue.icon,
      color: formValue.color,
      profile_id: this.activeProfileId,
    };

    const request$ = this.isEditMode && this.currentCategoryId
      ? this.categoryService.updateCategory(this.currentCategoryId, categoryData)
      : this.categoryService.createCategory(categoryData);

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
        this.loadCategories();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: err => {
        this.errorMessage = 'Failed to save category.';
        console.error('Failed to save category:', err);
        this.cdr.detectChanges();
      },
    });
  }

  // Remove categoria apos confirmacao do usuario.
  onDelete(id: string, event: Event): void {
    event.stopPropagation();

    this.confirmModal.confirm({
      title: 'Delete category',
      message: 'Are you sure you want to delete this category?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.categoryService.deleteCategory(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
          next: () => this.loadCategories(),
          error: err => {
            this.errorMessage = 'Failed to delete category.';
            console.error('Failed to delete category:', err);
            this.cdr.detectChanges();
          },
        });
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.checkFieldInvalid(this.categoryForm, fieldName);
  }
}
