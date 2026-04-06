# Endpoints da API

A API segue o padrão REST, utilizando o prefixo base `/api/v1`. Todas as comunicações utilizam o formato `application/json`. 

Para garantir a segurança e o isolamento de dados, os recursos são filtrados pelo contexto do utilizador ativo (`user_id`) ou do seu espaço de trabalho (`profile_id`).

## Sistema e Monitorização
* `GET /api/v1/health` - Verifica o estado de saúde da API (Uptime/Ping).
* `GET /api/v1` - Endpoint raiz que retorna a mensagem de boas-vindas e a versão da API.

## Dashboard
* `GET /api/v1/dashboard/summary` - Obtém o resumo financeiro (saldos, receitas, despesas) filtrado por `profile_id`, `month` e `year`.

## Perfis & Configurações (Profiles & Settings)
* `POST /api/v1/profiles` - Cria um novo perfil (Workspace).
* `GET /api/v1/profiles?user_id={id}` - Lista todos os perfis pertencentes a um utilizador.
* `PATCH /api/v1/profiles/:id` - Atualiza dados do perfil (ex: nome, ícone).
* `DELETE /api/v1/profiles/:id` - Remove um perfil (*soft delete*).
* `POST /api/v1/user-settings` - Inicializa as configurações globais do utilizador.
* `GET /api/v1/user-settings?user_id={id}` - Lê as configurações de um utilizador.
* `PATCH /api/v1/user-settings/:user_id` - Atualiza as preferências (tema, moeda, idioma).

## Entidades Base (Core Entities)
* **Accounts (Contas)**
  * `POST /api/v1/accounts` - Cria uma nova conta bancária ou carteira.
  * `GET /api/v1/accounts?profile_id={id}` - Lista todas as contas ativas de um perfil.
  * `PATCH /api/v1/accounts/:id` - Atualiza os detalhes de uma conta (ex: nome, cor).
  * `DELETE /api/v1/accounts/:id` - Deleta uma conta (*soft delete*).

* **Categories (Categorias)**
  * `POST /api/v1/categories` - Cria uma nova categoria financeira.
  * `GET /api/v1/categories?profile_id={id}` - Lista todas as categorias de um perfil.
  * `PATCH /api/v1/categories/:id` - Atualiza detalhes (ex: nome, ícone, cor).
  * `DELETE /api/v1/categories/:id` - Deleta uma categoria (*soft delete*).

* **Tags (Etiquetas)**
  * `POST /api/v1/tags` - Cria uma nova etiqueta para cruzamento de dados.
  * `GET /api/v1/tags?profile_id={id}` - Lista as tags de um perfil.
  * `PATCH /api/v1/tags/:id` - Atualiza os detalhes de uma tag.
  * `DELETE /api/v1/tags/:id` - Deleta uma tag (*soft delete*).

## Operações Financeiras
* **Transactions (Transações)**
  * `POST /api/v1/transactions` - Regista uma nova transação (atualiza o saldo da conta associada).
  * `GET /api/v1/transactions/:id` - Obtém os detalhes de uma transação específica.
  * `PATCH /api/v1/transactions/:id` - Atualiza a transação (aplica estratégia de compensação no saldo antigo vs. novo).
  * `DELETE /api/v1/transactions/:id` - Deleta a transação (*soft delete* e reversão do impacto no saldo).
  * `GET /api/v1/transactions` - Lista transações. **Suporta múltiplos filtros em simultâneo:**
    * `?profile_id={id}` (Obrigatório)
    * `?month={1-12}&year={YYYY}` (Filtro temporal)
    * `?type=INCOME|EXPENSE|TRANSFER` (Filtro por tipo)
    * `?category_id={id}` (Filtro por categoria)
    * `?account_id={id}` (Filtro por conta)

* **Installment Plans (Parcelamentos)**
  * `POST /api/v1/installments` - Cria um novo plano de compras parceladas.
  * `GET /api/v1/installments?profile_id={id}` - Lista planos ativos.
  * `PATCH /api/v1/installments/:id` - Atualiza plano.
  * `DELETE /api/v1/installments/:id` - Cancela/elimina o plano.

* **Recurring Transactions (Recorrentes)**
  * `POST /api/v1/recurring` - Configura uma transação automática (ex: assinaturas).
  * `GET /api/v1/recurring?profile_id={id}` - Lista subscrições e contas fixas.
  * `PATCH /api/v1/recurring/:id` - Atualiza a configuração da recorrência.
  * `DELETE /api/v1/recurring/:id` - Cancela a transação recorrente.

## Planeamento Financeiro
* **Budgets (Orçamentos)**
  * `POST /api/v1/budgets` - Define um teto de gastos mensal por categoria.
  * `GET /api/v1/budgets?profile_id={id}` - Lista orçamentos definidos.
  * `PATCH /api/v1/budgets/:id` - Atualiza o limite do orçamento.
  * `DELETE /api/v1/budgets/:id` - Deleta o orçamento.

* **Goals (Metas)**
  * `POST /api/v1/goals` - Cria uma meta de poupança.
  * `GET /api/v1/goals?profile_id={id}` - Lista as metas.
  * `PATCH /api/v1/goals/:id` - Atualiza o valor objetivo ou progresso.
  * `DELETE /api/v1/goals/:id` - Cancela a meta.

### Formato Padrão de Resposta
Para garantir previsibilidade no Frontend, todas as respostas (sucesso ou erro) partilham uma estrutura comum:

**Sucesso (Exemplo `200 OK` / `201 Created`):**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Erro (Exemplo `400 Bad Request` / `404 Not Found` / `500 Internal Error`):**
```json
{
  "status": "error",
  "message": "Mensagem de erro"
}
```
