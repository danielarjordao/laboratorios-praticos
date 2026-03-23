import { supabase } from '../config/supabase.js';

// A interface "AccountInput" define a estrutura dos dados que a função "createAccountRecord" espera receber.
// Ela é usada para garantir que os dados enviados pelo Controller estão completos e corretos antes de tentar gravá-los no banco de dados.
export interface AccountInput {
    profile_id: string;
    name: string;
    type?: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'CASH';
    balance?: number;
}

// Recebe os dados já com a garantia de que respeitam a Interface "AccountInput"
export const createAccountRecord = async (accountData: AccountInput) => {
	// Desestruturação dos dados para facilitar a manipulação
    const { profile_id, name, type, balance } = accountData;

	// Comunicação com o Supabase
    const { data, error } = await supabase
        .from('accounts')
        .insert([{
            profile_id,
            name,
			// Se o tipo não for fornecido, assume "CHECKING" como padrão, pois é o tipo mais comum de conta.
            type: type || 'CHECKING',
			// Se o saldo inicial não for fornecido, assume 0 como padrão, pois a maioria das contas começa sem saldo.
            balance: balance || 0
        }])
        .select();

	// Se o Supabase retornar um erro, lança-o para ser tratado pelo Controller
    if (error)
		throw error;

    return data[0];
};
