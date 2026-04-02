import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readTransactionById, createTransaction } from './transactionService.js';
import type { CreateTransactionDTO } from '../models/transactionModel.js';
import { supabase } from '../config/supabase.js';

// Mocks do Supabase e de outras funções auxiliares
// Essas funções serão substituídas por implementações simuladas durante os testes
vi.mock('../config/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('./tagService.js', () => ({
  linkTagsToTransaction: vi.fn(),
}));

vi.mock('./accountService.js', () => ({
  updateAccountBalance: vi.fn(),
}));

vi.mock('../utils/dateHelpers.js', () => ({
  getNowIso: vi.fn(() => '2026-04-02T12:00:00.000Z'),
}));

// Helper para simular a cadeia de chamadas do Supabase (select, insert, eq, etc.)
const mockChain = (overrides: Record<string, unknown> = {}) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    ...overrides,
  };

  // O supabase.from() deve retornar essa cadeia simulada
  vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>);
  return chain;
};

// Testes para a TransactionService
describe('TransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TESTE 1: Validação de Regras de Negócio
  it('Deve lançar erro ao tentar criar INCOME com conta de destino (transfer_account_id)', async () => {
    const invalidTransactionParams = {
      type: 'INCOME',
      amount: 100,
      account_id: 'acc-123',
      transfer_account_id: 'acc-456', // Proibido para INCOME
      category_id: 'cat-123',
    } as CreateTransactionDTO;

    // A validação deve rejeitar a transação antes sequer de chamar o Supabase
    await expect(createTransaction(invalidTransactionParams)).rejects.toThrow(
      'Incomes and Expenses should not have a transfer account.'
    );
    expect(supabase.from).not.toHaveBeenCalled();
  });

  // TESTE 2: Transação de Leitura por ID com Sucesso
  it('Deve buscar uma transação por ID com sucesso', async () => {
    const mockDbResponse = {
      id: 'tx-123',
      amount: 50,
      type: 'EXPENSE',
      description: 'Supermercado',
    };

    // Simula que o Supabase devolveu a transação corretamente
    mockChain({
      single: vi.fn().mockResolvedValue({ data: mockDbResponse, error: null }),
    });

	// Chama a função de leitura de transação por ID
    const result = await readTransactionById('tx-123');

	// Verifica se o Supabase foi chamado corretamente e se o resultado é o esperado
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(result).toEqual(mockDbResponse);
  });

  // TESTE 3: Tratamento de Erros do Supabase
  it('Deve lançar erro se a transação não for encontrada', async () => {
    // Simula que o Supabase devolveu um erro e nenhum dado
    mockChain({
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    });

	// Chama a função de leitura de transação por ID e espera que ela lance um erro
    await expect(readTransactionById('tx-999')).rejects.toThrow(
      'Transaction not found: Not found'
    );
	// Verifica se o Supabase foi chamado corretamente
    expect(supabase.from).toHaveBeenCalledWith('transactions');
  });
});
