# Esquema da Base de Dados (Database Schema)

O sistema utiliza PostgreSQL (via Supabase) e é composto por 11 tabelas principais. A arquitetura foi desenhada com suporte a *Soft Delete* (através da coluna `deleted_at`) e rastreabilidade de alterações (`created_at`, `updated_at`).

## 1. Entidades Base e Configurações

### `profiles`

Gere os perfis associados a um utilizador autenticado (1 utilizador pode ter N perfis).

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `user_id` | `uuid` | Chave Estrangeira (Auth) |
| `name` | `varchar` | Nome do perfil |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete (Nulo se ativo) |

### `user_settings`

Configurações globais e preferências do utilizador (Relação 1:1).

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `user_id` | `uuid` | Chave Estrangeira (Auth) |
| `theme` | `varchar` | Ex: 'light', 'dark' |
| `currency` | `varchar` | Ex: 'EUR', 'BRL' |
| `language` | `varchar` | Ex: 'pt-PT', 'en-US' |
| `receive_notifications` | `boolean` | Notificações ativas |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |

## 2. Cadastros Estruturais

### `accounts`

Contas bancárias, carteiras ou cartões de crédito.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `profile_id` | `uuid` | Chave Estrangeira |
| `name` | `varchar` | Nome da conta |
| `type` | `text` | Ex: 'CHECKING', 'CREDIT' |
| `initial_balance` | `numeric` | Saldo inicial configurado |
| `balance` | `numeric` | Saldo atualizado automaticamente |
| `is_main_featured` | `boolean` | Conta principal em destaque |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete |

### `categories`

Categorias para classificar as transações. Suporta hierarquia e customização visual.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `profile_id` | `uuid` | Chave Estrangeira |
| `name` | `varchar` | Nome da categoria |
| `type` | `varchar` | Ex: 'INCOME', 'EXPENSE' |
| `icon` | `text` | Identificador visual/ícone |
| `color` | `text` | Cor da categoria na UI |
| `parent_id` | `uuid` | Referência para subcategorias |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete |

### `tags`

Etiquetas personalizadas para agrupamento livre.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `profile_id` | `uuid` | Chave Estrangeira |
| `name` | `varchar` | Nome da etiqueta |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete |

## 3. Operações Financeiras

### `transactions`

Registo central de todas as movimentações financeiras.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `account_id` | `uuid` | Chave Estrangeira (Conta Origem) |
| `transfer_account_id` | `uuid` | Chave Estrangeira (Conta Destino) |
| `category_id` | `uuid` | Chave Estrangeira (Categoria) |
| `installment_plan_id` | `uuid` | Refere a compra parcelada |
| `installment_number` | `int4` | Número da parcela (ex: 1) |
| `type` | `varchar` | 'INCOME', 'EXPENSE', 'TRANSFER' |
| `amount` | `numeric` | Valor da transação |
| `date` | `date` | Data da transação |
| `effective_date` | `date` | Data de efetivação/liquidação |
| `description` | `text` | Descrição/Nota |
| `status` | `varchar` | 'COMPLETED', 'PENDING' |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete |

### `transaction_tags`

Tabela de junção (N:N) entre Transações e Etiquetas.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `transaction_id` | `uuid` | Chave Estrangeira |
| `tag_id` | `uuid` | Chave Estrangeira |

### `installment_plans`

Gestão de compras parceladas (Gera transações derivadas).

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `profile_id` | `uuid` | Chave Estrangeira |
| `description` | `text` | Descrição do plano |
| `total_parts` | `int4` | Número total de parcelas |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete |

### `recurring_transactions`

Gestão de assinaturas e contas fixas para geração futura.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `profile_id` | `uuid` | Chave Estrangeira |
| `account_id` | `uuid` | Chave Estrangeira |
| `category_id` | `uuid` | Chave Estrangeira |
| `type` | `varchar` | 'INCOME', 'EXPENSE' |
| `amount` | `numeric` | Valor recorrente |
| `frequency` | `varchar` | Ex: 'MONTHLY' |
| `interval_value` | `int4` | Ex: A cada '1' mês |
| `start_date` | `date` | Data de início |
| `next_run_date` | `date` | Data da próxima cobrança |
| `end_date` | `date` | Data de fim (Opcional) |
| `description` | `text` | Descrição da assinatura |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete |

## 4. Planeamento Financeiro

### `budgets`

Limites de gastos estabelecidos por categoria e por mês.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `profile_id` | `uuid` | Chave Estrangeira |
| `category_id` | `uuid` | Chave Estrangeira |
| `limit_amount` | `numeric` | Valor máximo do orçamento |
| `month_date` | `date` | Mês de referência |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete |

### `goals`

Objetivos e metas financeiras.

| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave Primária |
| `profile_id` | `uuid` | Chave Estrangeira |
| `title` | `varchar` | Nome da meta |
| `target_amount` | `numeric` | Valor alvo a atingir |
| `deadline` | `date` | Prazo limite |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |
| `deleted_at` | `timestamptz` | Soft delete |
