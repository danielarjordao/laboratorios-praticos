# Endpoints da API

A API segue o padrão REST, com validação de dados (DTOs) e respostas padronizadas. O prefixo base é `/api/v1`.

## 👤 Profiles & Settings

* **Profiles**
  * `POST /profiles` - Cria um novo perfil.
  * `GET /profiles?user_id={id}` - Lista todos os perfis de um utilizador.
  * `PATCH /profiles/:id` - Atualiza dados do perfil (ex: nome).
  * `DELETE /profiles/:id` - Remove um perfil (soft delete).
* **User Settings**
  * `POST /user-settings` - Cria as configurações iniciais do utilizador.
  * `GET /user-settings?user_id={id}` - Lê as configurações do utilizador.
  * `PATCH /user-settings/:user_id` - Atualiza preferências (tema, moeda, idioma).

### Cadastros Estruturais

* **Accounts**
  * `POST /accounts` - Regista uma nova conta bancária.
  * `GET /accounts?profile_id={id}` - Lista contas do perfil.
  * `PATCH /accounts/:id` - Atualiza detalhes da conta.
  * `DELETE /accounts/:id` - Remove a conta (soft delete).
* **Categories**
  * `POST /categories` - Cria categoria (suporta subcategorias via `parent_id`).
  * `GET /categories?profile_id={id}` - Lista categorias.
  * `PATCH /categories/:id` - Atualiza a categoria.
  * `DELETE /categories/:id` - Remove a categoria (soft delete).
* **Tags**
  * `POST /tags` - Cria uma nova etiqueta.
  * `GET /tags?profile_id={id}` - Lista todas as etiquetas.
  * `PATCH /tags/:id` - Atualiza o nome/cor da etiqueta.
  * `DELETE /tags/:id` - Remove a etiqueta (soft delete).

### Operações

* **Transactions**
  * `POST /transactions` - Regista transação, associa tags e atualiza o saldo da conta.
  * `GET /transactions?profile_id={id}` - Lista histórico de transações.
  * `PATCH /transactions/:id` - Atualiza detalhes da transação.
  * `DELETE /transactions/:id` - Cancela transação e reverte o saldo na conta.
* **Installment Plans (Parcelamentos)**
  * `POST /installments` - Cria plano mestre e gera as transações parceladas.
  * `GET /installments?profile_id={id}` - Lista planos e respetivas parcelas (JOIN).
  * `PATCH /installments/:id` - Atualiza a descrição do plano mestre.
  * `DELETE /installments/:id` - Cancela o plano e as parcelas pendentes.
* **Recurring Transactions (Recorrentes)**
  * `POST /recurring` - Cria nova subscrição ou despesa fixa.
  * `GET /recurring?profile_id={id}` - Lista despesas recorrentes ativas.
  * `PATCH /recurring/:id` - Atualiza valor ou frequência da recorrência.
  * `DELETE /recurring/:id` - Cancela a assinatura/despesa recorrente.

### Planeamento Financeiro

* **Budgets (Orçamentos)**
  * `POST /budgets` - Define limite mensal (valida duplicados por mês/categoria).
  * `GET /budgets?profile_id={id}&month_date={date}` - Lista orçamentos do mês.
  * `PATCH /budgets/:id` - Atualiza o valor limite do orçamento.
  * `DELETE /budgets/:id` - Remove o orçamento (soft delete).
* **Goals (Metas)**
  * `POST /goals` - Cria uma nova meta financeira.
  * `GET /goals?profile_id={id}` - Lista metas ordenadas por data limite.
  * `PATCH /goals/:id` - Atualiza o valor alvo ou data da meta.
  * `DELETE /goals/:id` - Remove a meta financeira (soft delete).
