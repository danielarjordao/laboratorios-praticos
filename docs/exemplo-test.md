# Exemplo de Testes com Vitest

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userService from '../services/userService.js';
import supabase from '../supabase.js';

vi.mock('../supabase.js', () => ({
  default: {
    from: vi.fn(),
  },
}));

const mockChain = (overrides: Record<string, any> = {}) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    ...overrides,
  };

  vi.mocked(supabase.from).mockReturnValue(chain as any);
  return chain;
};

describe('UserService - get', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Deve retornar a lista de utilizadores', async () => {
    const mockUsers = [{ id: '1', fullName: 'mike', email: 'mike@teste.com' }];

    mockChain({
      select: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
    });

    const response = await userService.getUsers();

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(response).toEqual(mockUsers);
  });

  it('Caso o supabase retorna um erro, deve retornar o erro', async () => {
    const responseData = { data: null, error: { message: "error" } }
    const error = new Error(responseData.error.message)
    mockChain({
      select: vi.fn().mockResolvedValue(responseData)
    });

    const response = await userService.getUsers();

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(response).toEqual(error);
  });
});

describe('UserService - createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Deve criar um utilizador com sucesso', async () => {
    const mockUser = { id: '1', full_name: 'Mike', email: 'mike@teste.com' };

    mockChain({
      single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    });

    const result = await userService.createUser('Mike', 'mike@teste.com');

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(result).toEqual(mockUser);
  });

  it('Deve lançar erro para email inválido', async () => {
    await expect(userService.createUser('Mike', 'invalid-email'))
      .rejects.toThrow('Email inválido');

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('Deve retornar o erro quando o Supabase falhar na inserção', async () => {
    const apiError = { message: 'Database error' };

    mockChain({
      single: vi.fn().mockResolvedValue({ data: null, error: apiError }),
    });

    const result = await userService.createUser('Mike', 'mike@teste.com');

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe('Database error');
  });
});
```
