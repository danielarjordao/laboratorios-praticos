import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmModalService, ConfirmOptions } from '../../services/confirm-modal';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css']
})
export class ConfirmModalComponent {
  private readonly confirmService = inject(ConfirmModalService);
  private readonly destroyRef = inject(DestroyRef);

  options: ConfirmOptions | null = null;

  constructor() {
    this.confirmService.modalState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(opts => {
        this.options = opts;
      });
  }

  onConfirm(): void {
    this.confirmService.respond(true);
  }

  onCancel(): void {
    this.confirmService.respond(false);
  }
}
