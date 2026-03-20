# Previsão do Esquema da Base de Dados (Versão Final de Produção)

## 1. Nível Global (Autenticação e Configurações)

* **`auth.users`** (Tabela gerida pelo Supabase)
  * `id` (PK)
* **`user_settings`** (1 para 1 com o utilizador)
  * `id` (PK)
  * `user_id` (FK) -> 🔗 *Liga a auth.users*
  * `theme`, `currency`, `language`, `receive_notifications`
  * `created_at`, `updated_at`

## 2. Nível do Domínio (Isolamento de Contexto)

* **`profiles`** (Os seus espaços: Pessoal, Casal)
  * `id` (PK)
  * `user_id` (FK) -> 🔗 *Liga a auth.users*
  * `name`, `created_at`, `updated_at`
* **`accounts`** (Carteiras/Contas Bancárias)
  * `id` (PK)
  * `profile_id` (FK) -> 🔗 *Liga a profiles*
  * `name`, `initial_balance` *(Apenas semente inicial)*, `is_main_featured`
  * `created_at`, `updated_at`
* **`categories`** (Árvore de classificação isolada por perfil)
  * `id` (PK)
  * `profile_id` (FK) -> 🔗 *Liga a profiles*
  * `parent_id` (FK) -> 🔗 *Liga a categories (Bloqueado contra auto-referência A=A)*
  * `name`, `type` ('INCOME' ou 'EXPENSE')
  * `created_at`, `updated_at`
* **`tags`** (Etiquetas contextuais)
  * `id` (PK)
  * `profile_id` (FK) -> 🔗 *Liga a profiles*
  * `name` *(Única por perfil, ignorando maiúsculas/minúsculas)*
  * `created_at`

## 3. Nível Transacional (O Motor Principal)

* **`installment_plans`** (Pai das parcelas)
  * `id` (PK)
  * `profile_id` (FK) -> 🔗 *Liga a profiles*
  * `description`, `total_parts` *(Sempre > 1)*
  * `created_at`, `updated_at`
* **`transactions`** (O núcleo blindado)
  * `id` (PK)
  * `account_id` (FK) -> 🔗 *Liga a accounts* (Conta base)
  * `transfer_account_id` (FK) -> 🔗 *Liga a accounts* (Conta destino)
  * `category_id` (FK) -> 🔗 *Liga a categories*
  * `installment_plan_id` (FK) -> 🔗 *Liga a installment_plans*
  * `installment_number` *(Sempre > 0)*
  * `type` ('INCOME', 'EXPENSE', 'TRANSFER')
  * `amount` *(Obrigatório ser ≥ 0)*
  * `date` *(Data da compra)*
  * `effective_date` *(Data da liquidação real na conta)*
  * `description`, `status` ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
  * `created_at`, `updated_at`
  * **Regras de Integridade (A Base de Dados rejeita se não cumprir):**
    * Se `TRANSFER`: Tem de ter conta destino, origem e destino têm de ser diferentes, e a categoria tem de ser nula.
    * Se `INCOME` ou `EXPENSE`: A conta destino tem de ser nula e a categoria é obrigatória.
* **`transaction_tags`** (Associação M:N)
  * `transaction_id` (FK) -> 🔗 *Liga a transactions*
  * `tag_id` (FK) -> 🔗 *Liga a tags*

## 4. Nível de Automação e Planeamento

* **`recurring_transactions`** (Despesas/Receitas automáticas)
  * `id` (PK)
  * `profile_id` (FK) -> 🔗 *Liga a profiles*
  * `account_id` (FK) -> 🔗 *Liga a accounts*
  * `category_id` (FK) -> 🔗 *Liga a categories*
  * `type` ('INCOME' ou 'EXPENSE')
  * `amount` *(Sempre ≥ 0)*
  * `frequency` ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
  * `interval_value` *(Sempre > 0)*
  * `start_date`, `next_run_date`, `end_date`
  * `description`, `created_at`, `updated_at`
* **`budgets`** (Limites mensais)
  * `id` (PK)
  * `profile_id` (FK) -> 🔗 *Liga a profiles*
  * `category_id` (FK) -> 🔗 *Liga a categories*
  * `limit_amount` *(Sempre > 0)*
  * `month_date` *(Obrigado a ser sempre o dia 1 do mês)*
  * `created_at`, `updated_at`
* **`goals`** (Metas de poupança)
  * `id` (PK)
  * `profile_id` (FK) -> 🔗 *Liga a profiles*
  * `title`, `target_amount` *(Sempre > 0)*
  * `deadline`
  * `created_at`, `updated_at`
