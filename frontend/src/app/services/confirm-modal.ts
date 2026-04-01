import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Se for true, o botão de confirmar fica vermelho
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  private readonly modalState = new BehaviorSubject<ConfirmOptions | null>(null);
  private responseSubject: Subject<boolean> | null = null;

  // O componente do Modal vai subscrever a este Observable para saber quando abrir
  readonly modalState$ = this.modalState.asObservable();

  // Função chamada pelos outros componentes (ex: Accounts, Categories)
  confirm(options: ConfirmOptions): Observable<boolean> {
    // Se já existir um modal pendente, resolve-o como cancelado.
    this.respond(false);

    this.responseSubject = new Subject<boolean>();
    this.modalState.next(options);
    return this.responseSubject.asObservable();
  }

  // Função chamada pelos botões do próprio Modal (Confirmar / Cancelar)
  respond(result: boolean): void {
    this.modalState.next(null); // Fecha o modal
    if (this.responseSubject) {
      this.responseSubject.next(result); // Envolve o resultado (true/false)
      this.responseSubject.complete(); // Limpa a subscrição
      this.responseSubject = null;
    }
  }
}
