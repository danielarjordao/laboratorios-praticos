# Endpoints da API

A API segue o padrão REST, utilizando o prefixo base `/api/v1`. Todas as rotas comunicam utilizando JSON e devolvem respostas padronizadas.

## Dashboard

* **Dashboard Summary**
  * `GET /api/v1/dashboard/summary` - Obtém o resumo mensal do dashboard (saldos, receitas, despesas).

## Profiles & Settings

* **Profiles (Perfis)**
  * `POST /api/v1/profiles` - Cria um novo perfil.
  * `GET /api/v1/profiles?user_id={id}` - Lista todos os perfis de um utilizador.
  * `PATCH /api/v1/profiles/:id` - Atualiza dados do perfil (ex: nome).
  * `DELETE /api/v1/profiles/:id` - Remove um perfil (soft delete).

* **User Settings (Configurações)**
  * `POST /api/v1/user-settings` - Cria as configurações iniciais do utilizador.
  * `GET /api/v1/user-settings?user_id={id}` - Lê as configurações de um utilizador.
  * `PATCH /api/v1/user-settings/:user_id` - Atualiza as configurações (tema, moeda, idioma).

## Cadastros Estruturais

* **Accounts (Contas)**
  * `POST /api/v1/accounts` - Cria uma nova conta bancária.
  * `GET /api/v1/accounts?profile_id={id}` - Lista todas as contas de um perfil.
  * `PATCH /api/v1/accounts/:id` - Atualiza os detalhes de uma conta existente.
  * `DELETE /api/v1/accounts/:id` - Deleta uma conta (soft delete).

* **Categories (Categorias)**
  * `POST /api/v1/categories` - Cria uma nova categoria.
  * `GET /api/v1/categories?profile_id={id}` - Lista todas as categorias de um perfil.
  * `PATCH /api/v1/categories/:id` - Atualiza os detalhes de uma categoria existente.
  * `DELETE /api/v1/categories/:id` - Deleta uma categoria (soft delete).

* **Tags (Etiquetas)**
  * `POST /api/v1/tags` - Cria uma nova tag.
  * `GET /api/v1/tags?profile_id={id}` - Lista todas as tags de um perfil.
  * `PATCH /api/v1/tags/:id` - Atualiza os detalhes de uma tag existente.
  * `DELETE /api/v1/tags/:id` - Deleta uma tag (soft delete).

## Operações Financeiras

* **Transactions (Transações)**
  * `POST /api/v1/transactions` - Cria uma nova transação.
  * `GET /api/v1/transactions?profile_id={id}` - Lista todas as transações de um perfil.
  * `GET /api/v1/transactions/:id` - Obtém os detalhes de uma transação específica.
  * `PATCH /api/v1/transactions/:id` - Atualiza os detalhes de uma transação existente.
  * `DELETE /api/v1/transactions/:id` - Deleta uma transação (soft delete e reversão de saldo).

* **Installment Plans (Parcelamentos)**
  * `POST /api/v1/installments` - Cria um novo plano de parcelamento.
  * `GET /api/v1/installments?profile_id={id}` - Lista todos os planos de parcelamento.
  * `PATCH /api/v1/installments/:id` - Atualiza os detalhes de um plano existente.
  * `DELETE /api/v1/installments/:id` - Deleta um plano de parcelamento.

* **Recurring Transactions (Recorrentes)**
  * `POST /api/v1/recurring` - Cria uma nova transação recorrente.
  * `GET /api/v1/recurring?profile_id={id}` - Lista todas as transações recorrentes de um perfil.
  * `PATCH /api/v1/recurring/:id` - Atualiza os detalhes de uma transação recorrente existente.
  * `DELETE /api/v1/recurring/:id` - Deleta uma transação recorrente.

## Planeamento Financeiro

* **Budgets (Orçamentos)**
  * `POST /api/v1/budgets` - Cria um novo orçamento.
  * `GET /api/v1/budgets?profile_id={id}` - Lista todos os orçamentos de um perfil.
  * `PATCH /api/v1/budgets/:id` - Atualiza os detalhes de um orçamento existente.
  * `DELETE /api/v1/budgets/:id` - Deleta um orçamento (soft delete).

* **Goals (Metas)**
  * `POST /api/v1/goals` - Cria uma nova meta.
  * `GET /api/v1/goals?profile_id={id}` - Lista todas as metas de um perfil.
  * `PATCH /api/v1/goals/:id` - Atualiza os detalhes de uma meta existente.
  * `DELETE /api/v1/goals/:id` - Deleta uma meta (soft delete).
