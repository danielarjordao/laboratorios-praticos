# Cronograma Diário (Sprints)

## Fase 1: Backend e Base de Dados (Foco: TP1) - CONCLUÍDO

**Dia 20/03 (Sexta-feira):**

* Inicialização do backend com `package.json` e `tsconfig.json`.
* Adição de `.gitignore`.
* Criação de documentação inicial (`schema`, planejamento estratégico, resumo do projeto e endpoints).

**Dia 23/03 (Segunda-feira):**

* Implementação do CRUD base: Criação de rotas e controllers para `Accounts`, `Categories` e `Transactions`.
* Integração inicial com o Supabase.
* Configuração do ESLint e TypeScript.
* Adição do pipeline de CI (GitHub Actions) para linting.
* Refatoração de validações e tratamentos de erros nas funções principais.
* Implementação da listagem (GET) e deleção (DELETE, com soft delete) para as tabelas principais.

**Dia 24/03 (Terça-feira):**

* Implementação do CRUD de `Tags` e associação com transações (`transaction_tags`).
* Desenvolvimento de `Installment Plans` (Planos de Parcelamento) com CRUD.
* Criação de rotas para `Budgets` (Orçamentos).
* Lógica para atualização automática de saldo das contas nas transações.
* Adição do template de Pull Request (`PR Template`).
* Implementação do resumo mensal (`Monthly Summary`).

**Dia 25/03 (Quarta-feira) - Entrega TP1:**

* Criação de endpoints de `Goals` (Metas), `Profiles` (Perfis) e `User Settings` (Configurações).
* Padronização das nomenclaturas dos controllers e services (ex: `readCategories`).
* Refinamento das interfaces de resposta e atualizações de campos (ex: `parent_id` e `is_main_featured`).
* Documentação final do schema, endpoints e decisões arquiteturais.
* Adição de screenshots do Postman.
* Orquestração com Docker (criação de `Dockerfile` para frontend/backend e `docker-compose.yml`).
* Inicialização do projeto base em Angular (Frontend).

## Fase 2: Frontend MVP (Foco: TP2) - PRÓXIMOS PASSOS

**Dia 26/03 (Quinta-feira):**

* Revisão do TP1 com o formador (demonstração da infraestrutura).
* Mapeamento do *Routing* no Angular (Login, Dashboard, Transações, Perfil).

**Dia 27/03 (Sexta-feira):**

* Configuração do Supabase Auth no Angular (Interface de Login/Registo).
* Criação de *Services* (HTTP Client) para ligar o frontend ao backend containerizado.

**Dia 30/03 (Segunda-feira):**

* Construção do *layout* base com CSS puro (Navegação, Sidebar).
* Implementação dos cartões de resumo do Dashboard.

**Dia 31/03 (Terça-feira):**

* Construção de *Reactive Forms* com validações visuais para criar/editar Contas e Transações.

**Dia 01/04 (Quarta-feira) - Entrega TP2:**

* Deploy do Frontend na Vercel.
* Gravação do vídeo de demonstração (30 segundos).

## Fase 3: Segurança, CI/CD e Polimento (Foco: Defesa Final)

**Dia 02/04 (Quinta-feira):**

* Implementação da extração dinâmica do `profile_id` via JWT no backend.

**Dia 03/04 (Sexta-feira):**

* Implementação de testes unitários.
* Resolução de bugs da integração UI/API.

**Dia 06/04 (Segunda-feira):**

* Testes *end-to-end* em produção.
* Preparação de argumentos técnicos para a defesa.

**Dia 07/04 (Terça-feira):**

* Apresentação e defesa final do projeto.
