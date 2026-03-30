import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TransactionService } from '../../services/transaction';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css']
})
export class Transactions implements OnInit {
  private transactionService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);

  transactions: Transaction[] = [];
  totalRecords: number = 0;
  Math = Math; // Para usar funções matemáticas no template, como Math.ceil para paginação
  isLoading: boolean = true;
  errorMessage: string = '';

  // Formulário para os filtros de transações
  filterForm = new FormGroup({
    month: new FormControl<number>(new Date().getMonth() + 1),
    year: new FormControl<number>(new Date().getFullYear()),
    // Vazio significa "todos os tipos"
    type: new FormControl<string>(''),
    search: new FormControl<string>(''),
    page: new FormControl<number>(1),
    limit: new FormControl<number>(20),
    sortBy: new FormControl<string>('date'),
    sortOrder: new FormControl<string>('desc')
  });

  ngOnInit(): void {
    // Iniciar carregamento das transações com os filtros padrão (mês e ano atuais)
    this.loadTransactions();

    // Fica à escuta de mudanças nos filtros para recarregar as transações automaticamente
    this.filterForm.valueChanges.subscribe(() => {
      this.loadTransactions();
    });
  }

  // Método para carregar transações com base nos filtros atuais do formulário
  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const formValues = this.filterForm.getRawValue();

    // Prepara os filtros para a chamada do serviço, convertendo os valores conforme necessário
    const filters = {
      month: formValues.month !== null ? Number(formValues.month) : undefined,
      year: formValues.year !== null ? Number(formValues.year) : undefined,
      type: formValues.type ? formValues.type : undefined,
      search: formValues.search ? formValues.search : undefined,
      page: formValues.page !== null ? Number(formValues.page) : undefined,
      limit: formValues.limit !== null ? Number(formValues.limit) : undefined,
      sortBy: formValues.sortBy ? formValues.sortBy : undefined,
      sortOrder: formValues.sortOrder ? formValues.sortOrder : undefined
    };

    this.transactionService.getTransactions(filters).subscribe({
      // Atualiza o tipo esperado para coincidir com o Service
      next: (response: { data: Transaction[]; total: number }) => {
        this.transactions = response.data; // O array de transações
        this.totalRecords = response.total; // O total real vindo da base de dados
        this.isLoading = false;

        // Força a detecção de mudanças para garantir que a interface seja atualizada
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.errorMessage = 'Failed to load transactions. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching transactions:', err);
        // Força a detecção de mudanças para garantir que a interface seja atualizada mesmo em caso de erro
        this.cdr.detectChanges();
      }
    });
  }

  // Método para exportar as transações filtradas para CSV
  exportToCsv(): void {
    if (!this.transactions || this.transactions.length === 0) {
      return;
    }

    // Define os cabeçalhos das colunas
    const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Status', 'Amount'];

    // Mapeia os dados da tabela para coincidir com os cabeçalhos
    const csvData = this.transactions.map(tx => {
      return [
        tx.date,
        // Envolve as descrições em aspas duplas para evitar erros se o texto contiver vírgulas
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        `"${(tx.categories?.name || '---')}"`,
        `"${(tx.origin_account?.name || '---')}"`,
        tx.type,
        tx.status,
        tx.amount
      ].join(';');
    });

    // Junta o cabeçalho e os dados com quebras de linha (\n)
    const csvString = [headers.join(';'), ...csvData].join('\n');

    // Cria o ficheiro virtual (Blob)
    // \uFEFF é a marca de ordem de bytes (BOM) para UTF-8, garantindo que os caracteres acentuados sejam exibidos corretamente no Excel
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Cria um link invisível e simula o clique para descarregar
    const link = document.createElement('a');
    link.href = url;

    // Nome do ficheiro dinâmico com a data atual
    const fileName = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    // Limpeza
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
