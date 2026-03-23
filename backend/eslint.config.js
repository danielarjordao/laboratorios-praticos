import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

// Configuração do ESLint para o projeto, combinando as regras recomendadas para JavaScript e TypeScript,
// e adicionando regras específicas para garantir a qualidade do código.
export default [

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Se usar "any", o lint vai falhar e impedir o Merge
      '@typescript-eslint/no-explicit-any': 'error',
      // Obriga a que funções exportadas tenham tipos de retorno claros
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
    },
  }
];
