# Cumprimento do Enunciado - Laboratórios Práticos

## 1. Enquadramento do Projeto

Este projeto foi desenvolvido como aplicação full-stack no contexto da disciplina de Laboratórios Práticos, integrando de forma prática os temas da unidade curricular:

- HTML, CSS e TypeScript no frontend
- Angular 21+ para SPA e UX
- Node.js + Express no backend REST
- Supabase (PostgreSQL + Auth)
- Docker para execução local
- Git/GitHub para versionamento
- GitHub Actions para automação de CI

Tema selecionado: **Gestor de Finanças Pessoais** (ODS 1 - Erradicação da Pobreza).

Objetivo funcional do produto:
- Dar visibilidade simples sobre receitas, despesas e saldo
- Permitir controlo por categorias/perfis/contas
- Apoiar decisões financeiras do utilizador com dados reais

## 2. Objetivos de Aprendizagem - Como foram cumpridos

### 2.1 Construir uma API REST completa com Node.js e Express
**Cumprido.**
Evidências:
- API versionada em `/api/v1` com múltiplos recursos CRUD em `backend/server.ts`
- Rotas para transações, contas, categorias, tags, parcelamentos, recorrências, orçamentos, metas, dashboard, perfis e configurações.
- Documentação de endpoints em `docs/api-endpoints.md`

### 2.2 Integrar base de dados relacional via Supabase
**Cumprido.**
Evidências:
- Cliente Supabase no backend: dependência `@supabase/supabase-js` em `backend/package.json`
- Modelagem relacional com 11 tabelas e FKs em `docs/database-schema.md`
- Estratégia de `soft delete` e timestamps para rastreabilidade e compensação de saldos.

### 2.3 Desenvolver frontend Angular com autenticação, routing e formulários
**Cumprido.**
Evidências:
- Angular 21 em `frontend/package.json`
- Rotas protegidas e públicas em `frontend/src/app/app.routes.ts`
- Guardas de autenticação estritas em `frontend/src/app/guards/`
- Serviços modulares integrados e formulários reativos com validações (`ReactiveFormsModule`).

### 2.4 Ligar frontend e backend end-to-end
**Cumprido (arquitetura e implementação).**
Evidências:
- Frontend consome dados via services por domínio.
- Backend expõe recursos restritos via CORS configurado para os domínios de produção.

### 2.5 Deploy da aplicação em ambiente público
**Cumprido integralmente.**
Evidências:
- Frontend publicado e ativo na plataforma Vercel.
- Backend (API) publicado e ativo na plataforma Render.com.

### 2.6 Versionamento com Git (commits convencionais, branches, PRs)
**Cumprido.**
Evidências:
- Histórico com mais de 400 commits seguindo o padrão convencional (`feat:`, `fix:`, `docs:`).
- Fluxo de *Pull Requests* visível no repositório.
- Estratégia de branches justificada em `docs/decisions.md`.

### 2.7 Pipeline CI/CD com build, testes e deploy
**Cumprido.**
Evidências:
- CI configurado via GitHub Actions (`.github/workflows/ci.yml`) validando integração na branch principal.
- Execução automática de `lint`, `build` e `test`.
- Status Badge verde afixado no `README.md` principal.

## 3. Estrutura Técnica Obrigatória - Estado do Projeto

| Camada | Exigido no enunciado | Implementação no projeto | Estado |
| --- | --- | --- | --- |
| Frontend | Angular 21+ TypeScript | Angular 21.2 + TS | Cumprido |
| Backend | Node.js 24+ Express | Node 24 + Express 5 + TS | Cumprido |
| Base de Dados | Supabase (PostgreSQL) | Supabase + schema relacional | Cumprido |
| Autenticação | Supabase Auth (JWT) | Auth Supabase no frontend + guards | Cumprido |
| Repositório | Git + GitHub | Monorepo com docs e histórico padronizado | Cumprido |
| CI/CD | GitHub Actions + Deploy | CI implementado + Badge Verde + Deploy Vercel/Render | Cumprido |

## 4. Avaliação por Entregas - Evidência de Preparação

**TP1 - Backend (Sessão 4)**
- Backend implementado, schema documentado e endpoints validados.
- Evidências: `backend/README.md`, `docs/api-endpoints.md`, `docs/database-schema.md`.

**TP2 - Frontend (Sessão 8)**
- SPA Angular funcional, rotas protegidas, formulários e integração com backend.
- Evidências: Códigos fonte na pasta `/frontend/src/app`.

**Projeto Final (Sessão 12)**
- URL pública funcional (API e UI), CRUD completo em produção, CI verde.
- Evidências: Links de produção no `README.md` raiz, arquitetura justificada em `docs/decisions.md`.

## 5. Requisitos Mínimos - Mapeamento ponto a ponto

### 5.1 Autenticação com email/password (Supabase Auth)
**Cumprido.** Sign up, sign in, sign out e proteção de rotas ativas.

### 5.2 CRUD completo da entidade principal
**Cumprido.** Entidade principal (transações) suporta: Criar, listar, ver detalhe, editar e eliminar (com reversão de saldo).

### 5.3 Frontend com pelo menos 4 páginas/rotas
**Cumprido.** Projeto possui rotas de Login, Dashboard, Transações, Perfil e Configurações.

### 5.4 Formulários reativos com validações visíveis
**Cumprido.** Feedback visual dinâmico em formulários de Transações, Contas, Categorias e Perfis.

### 5.5 API Node/Express com pelo menos 5 endpoints
**Cumprido.** API documentada em `api-endpoints.md`.

### 5.6 Dados persistidos no Supabase
**Cumprido.** Operações reais num PostgreSQL gerido, sem *mock data* em produção.

### 5.7 Deploy em produção com URL pública
**Cumprido integralmente.** Frontend no Vercel e Backend no Render.

### 5.8 Repositório GitHub público com README e commits convencionais
**Cumprido.** `README.md` exaustivo na raiz e histórico Git.

### 5.9 Pipeline GitHub Actions com pelo menos lint + build
**Cumprido.** Pipeline verde a correr processos de *linting*, testes unitários (Vitest) e *build*.

### 5.10 Pelo menos 3 testes unitários a passar
**Cumprido.** Serviço crítico testado (`transactionService.test.ts`) com *mocks* de base de dados.

## 6. Funcionalidades obrigatórias do tema Gestor de Finanças

### 6.1 Registo de transações com campos obrigatórios
**Cumprido.** Valor, tipo, categoria, data, conta e descrição implementados e validados.

### 6.2 Dashboard com saldo, receitas e despesas
**Cumprido.** Endpoint de resumo mensal a processar dados e UX dedicada no cliente.

### 6.3 Listagem com filtro por tipo e categoria
**Cumprido.** Filtros aplicados via backend (mês, ano, conta, categoria e tipo).

### 6.4 Cada utilizador vê apenas as próprias transações
**Cumprido.** O sistema isola os dados ativamente através do `profile_id` gerido dinamicamente.

### 6.5 Editar e eliminar transações
**Cumprido.** Fluxo de `update`/`delete` suportado pela *Estratégia de Compensação* para garantir integridade contábil.

## 7. Responsabilidades por Camada

**Frontend (Angular)**
- Autenticação e estado de UI/UX.
- Interação fluida, validações do tipo "fail-fast" e visualização reativa.
- *Não deve fazer:* Persistência direta de regras de negócio sem intermediação do servidor.

**Backend (Node.js + Express)**
- Expor contratos REST consistentes, validar as regras de domínio e persistir dados no Supabase.
- *Não deve fazer:* Renderização de interface ou depender do estado visual do cliente.

## 8. Decisões de Arquitetura (Resumo Executivo)
- **Monorepo:** Facilita integração e garante CI unificado.
- **TypeScript Full-Stack:** Reduz erros de contrato entre UI e API.
- **Controller-Service Pattern:** Código modular e testável.
- **Soft Delete & Compensação:** Protege o histórico financeiro sem corromper saldos.
- **Filtragem por Profile:** Garante o modelo SaaS Multi-workspace.
