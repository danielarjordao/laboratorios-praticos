# Cumprimento do Enunciado - Laboratorios Praticos

## 1. Enquadramento do Projeto

Este projeto foi desenvolvido como aplicacao full-stack no contexto da disciplina de Laboratorios Praticos, integrando de forma pratica os temas da unidade curricular:

- HTML, CSS e TypeScript no frontend
- Angular 21+ para SPA e UX
- Node.js + Express no backend REST
- Supabase (PostgreSQL + Auth)
- Docker para execucao local
- Git/GitHub para versionamento
- GitHub Actions para automacao de CI

Tema selecionado: **Gestor de Financas Pessoais** (ODS 1 - Erradicacao da Pobreza).

Objetivo funcional do produto:

- Dar visibilidade simples sobre receitas, despesas e saldo
- Permitir controlo por categorias/perfis/contas
- Apoiar decisoes financeiras do utilizador com dados reais

## 2. Objetivos de Aprendizagem - Como foram cumpridos

### 2.1 Construir uma API REST completa com Node.js e Express

**Cumprido.**

Evidencias:

- API versionada em `/api/v1` com multiplos recursos CRUD em [backend/server.ts](../backend/server.ts)
- Rotas para transacoes, contas, categorias, tags, parcelamentos, recorrencias, budgets, goals, dashboard, perfis e settings
- Documentacao de endpoints em [docs/api-endpoints.md](api-endpoints.md)

### 2.2 Integrar base de dados relacional via Supabase

**Cumprido.**

Evidencias:

- Cliente Supabase no backend: dependencia `@supabase/supabase-js` em [backend/package.json](../backend/package.json)
- Modelagem relacional com 11 tabelas e FKs em [docs/database-schema.md](database-schema.md)
- Estrategia de `soft delete` e timestamps para rastreabilidade

### 2.3 Desenvolver frontend Angular com autenticacao, routing e formularios

**Cumprido.**

Evidencias:

- Angular 21 em [frontend/package.json](../frontend/package.json)
- Rotas protegidas e publicas em [frontend/src/app/app.routes.ts](../frontend/src/app/app.routes.ts)
- Guard de autenticacao em [frontend/src/app/guards/auth-guard.ts](../frontend/src/app/guards/auth-guard.ts)
- Servico de autenticacao Supabase em [frontend/src/app/services/auth.ts](../frontend/src/app/services/auth.ts)
- Formularios reativos com validacoes no modulo de transacoes em [frontend/src/app/components/transaction-form/transaction-form.ts](../frontend/src/app/components/transaction-form/transaction-form.ts)

### 2.4 Ligar frontend e backend end-to-end

**Cumprido (arquitetura e implementacao).**

Evidencias:

- Frontend consome dados via services por dominio (accounts, categories, transactions, etc.)
- Backend expoe recursos necessarios para operacao completa
- CORS configurado para ambiente local e frontend publicado em [backend/server.ts](../backend/server.ts)

### 2.5 Deploy da aplicacao em ambiente publico

**Cumprido para frontend e previsto no backend (com evidencias de preparacao).**

Evidencias:

- Dominio frontend em producao presente no CORS do backend
- Dockerfiles para backend e frontend no repositorio
- Planeamento de deploy documentado em [docs/plan/project-plan.md](plan/project-plan.md)

### 2.6 Versionamento com Git (commits convencionais, branches, PRs)

**Cumprido em grande parte.**

Evidencias:

- Historico recente segue padrao convencional (`feat:`, `fix:`)
- Estrategia de branches documentada em [docs/decisions.md](decisions.md)
- Workflow CI em PR e push para `develop` e `main` em [.github/workflows/ci.yml](../.github/workflows/ci.yml)

### 2.7 Pipeline CI/CD com build, testes e deploy

**Cumprido.**

Evidencias:

- CI com jobs separados backend/frontend em [.github/workflows/ci.yml](../.github/workflows/ci.yml)
- Backend: install + lint + build + test
- Frontend: install + lint + build
- CD automatico ativo no Render (backend) e Vercel (frontend)

## 3. Estrutura Tecnica Obrigatoria - Estado do Projeto

| Camada | Exigido no enunciado | Implementacao no projeto | Estado |
| --- | --- | --- | --- |
| Frontend | Angular 21+ TypeScript | Angular 21.2 + TS | Cumprido |
| Backend | Node.js 24+ Express | Node 24 + Express 5 + TS | Cumprido |
| Base de Dados | Supabase (PostgreSQL) | Supabase + schema relacional | Cumprido |
| Autenticacao | Supabase Auth (JWT) | Auth Supabase no frontend + guards | Cumprido (com reforco backend recomendado) |
| Repositorio | Git + GitHub | Monorepo com docs e historico padronizado | Cumprido |
| CI/CD | GitHub Actions + Deploy automatico | CI implementado (lint/build/test) + CD automatico (Render/Vercel) | Cumprido |

## 4. Avaliacao por Entregas - Evidencia de Preparacao

## TP1 - Backend (Sessao 4)

Checklist:

- Backend implementado e documentado
- Endpoints listados
- Schema documentado

Evidencias:

- [backend/README.md](../backend/README.md)
- [docs/api-endpoints.md](api-endpoints.md)
- [docs/database-schema.md](database-schema.md)
- [docs/decisions.md](decisions.md)

## TP2 - Frontend (Sessao 8)

Checklist:

- SPA Angular funcional
- Rotas e formularios
- Integracao com backend e auth

Evidencias:

- [frontend/src/app/app.routes.ts](../frontend/src/app/app.routes.ts)
- [frontend/src/app/components](../frontend/src/app/components)
- [frontend/src/app/services](../frontend/src/app/services)

## Projeto Final (Sessao 12)

Checklist de defesa:

- URL publica funcional
- CRUD completo em producao
- CI verde
- Explicacao tecnica das decisoes

Evidencias ja preparadas:

- Arquitetura e justificacoes em [docs/decisions.md](decisions.md)
- Pipeline em [.github/workflows/ci.yml](../.github/workflows/ci.yml)
- Plano de consolidacao final em [docs/plan/project-plan.md](plan/project-plan.md)

## 5. Requisitos Minimos - Mapeamento ponto a ponto

### 5.1 Autenticacao com email/password (Supabase Auth)

**Cumprido.**

- Sign up, sign in, sign out e sessao ativa no service Auth
- Guardas de rota para paginas privadas

Evidencias:

- [frontend/src/app/services/auth.ts](../frontend/src/app/services/auth.ts)
- [frontend/src/app/guards/auth-guard.ts](../frontend/src/app/guards/auth-guard.ts)

### 5.2 CRUD completo da entidade principal

**Cumprido.**

- Entidade principal: transacoes
- Criar, listar, detalhe, editar e eliminar

Evidencias:

- Endpoints em [docs/api-endpoints.md](api-endpoints.md)
- Formulario e fluxo de edicao em [frontend/src/app/components/transaction-form/transaction-form.ts](../frontend/src/app/components/transaction-form/transaction-form.ts)

### 5.3 Frontend com pelo menos 4 paginas/rotas

**Cumprido (com folga).**

- Projeto possui varias rotas protegidas alem de login e termos

Evidencia:

- [frontend/src/app/app.routes.ts](../frontend/src/app/app.routes.ts)

### 5.4 Formularios reativos com validacoes visiveis

**Cumprido.**

- Validators e feedback visual de erro em diferentes modulos

Evidencia:

- [frontend/src/app/components/transaction-form/transaction-form.ts](../frontend/src/app/components/transaction-form/transaction-form.ts)

### 5.5 API Node/Express com pelo menos 5 endpoints

**Cumprido (muito acima do minimo).**

- API com dezenas de endpoints em recursos diferentes

Evidencias:

- [backend/server.ts](../backend/server.ts)
- [docs/api-endpoints.md](api-endpoints.md)

### 5.6 Dados persistidos no Supabase

**Cumprido.**

- Persistencia real via Supabase/PostgreSQL

Evidencias:

- [backend/package.json](../backend/package.json)
- [docs/database-schema.md](database-schema.md)

### 5.7 Deploy em producao com URL publica

**Cumprido no frontend; backend preparado e alinhado com plano de producao.**

Evidencias:

- CORS com dominio frontend publicado em [backend/server.ts](../backend/server.ts)
- Planeamento de deploy em [docs/plan/project-plan.md](plan/project-plan.md)

### 5.8 Repositorio GitHub publico com README e commits convencionais

**Cumprido.**

Evidencias:

- READMEs em [backend/README.md](../backend/README.md) e [frontend/README.md](../frontend/README.md)
- Historico recente com convencao `feat:` e `fix:`

### 5.9 Pipeline GitHub Actions com pelo menos lint + build

**Cumprido.**

Evidencia:

- [.github/workflows/ci.yml](../.github/workflows/ci.yml)

### 5.10 Pelo menos 3 testes unitarios a passar

**Cumprido.**

Evidencia:

- 3 testes no ficheiro [backend/src/services/transactionService.test.ts](../backend/src/services/transactionService.test.ts)

## 6. Funcionalidades obrigatorias do tema Gestor de Financas

### 6.1 Registo de transacoes com campos obrigatorios

**Cumprido.**

- Valor, tipo, categoria, data e descricao presentes no fluxo de formulario e API

### 6.2 Dashboard com saldo, receitas e despesas

**Cumprido.**

- Endpoint de resumo mensal no backend

### 6.3 Listagem com filtro por tipo e categoria

**Cumprido.**

- Listagem de transacoes com filtros no frontend

### 6.4 Cada utilizador ve apenas as proprias transacoes

**Cumprido funcionalmente por perfil ativo; reforco de seguranca recomendado no backend.**

- O frontend filtra por contexto de perfil/utilizador
- Para nivel maximo de seguranca, ideal extrair identidade do JWT no backend e/ou aplicar RLS completa

### 6.5 Editar e eliminar transacoes

**Cumprido.**

- Fluxo de update/delete no backend e no frontend

## 7. Responsabilidades por Camada

## Frontend (Angular)

Responsabilidades principais:

- Autenticacao e manutencao de sessao no cliente
- Navegacao e protecao de rotas
- Estado de UI e experiencia do utilizador
- Formularios reativos e validacoes
- Consumo da API REST e apresentacao de dados

Nao deve fazer:

- Regras criticas de seguranca como unica barreira
- Persistencia direta de regras de negocio sem backend

## Backend (Node.js + Express)

Responsabilidades principais:

- Expor contratos REST coesos e versionados
- Aplicar regras de negocio e validacoes de dominio
- Integrar e persistir dados no Supabase
- Garantir consistencia, tratamento de erros e respostas padronizadas

Nao deve fazer:

- Renderizacao de interface
- Dependencia de logica visual do frontend

## 8. Decisoes de Arquitetura (Resumo Executivo)

Decisoes adotadas e respetivo impacto:

- **Monorepo**: facilita integracao front/back e CI unificado
- **TypeScript em toda a stack**: reduz erros de contrato e runtime
- **Controller-Service pattern**: separa transporte HTTP de regra de negocio
- **Soft delete**: protege historico financeiro e rastreabilidade
- **Supabase PostgreSQL**: relacional forte para dominio financeiro
- **API versionada (`/api/v1`)**: prepara evolucao sem quebrar clientes
- **GitFlow (`main` + `develop` + `feat/*`)**: governa estabilidade e entrega

Referencia completa:

- [docs/decisions.md](decisions.md)

## 9. Riscos, lacunas e melhorias recomendadas

Para defesa final mais forte, recomenda-se:

1. Endurecer isolamento por utilizador no backend via JWT + validacao de ownership e/ou RLS total
2. Enriquecer o README raiz com links diretos para ambiente de producao e badge CI

## 10. Conclusao

O projeto cumpre os objetivos tecnicos centrais da UFCD e apresenta implementacao full-stack consistente com o enunciado. A base esta solida para defesa final, com destaque para:

- Arquitetura clara e documentada
- CRUD funcional e cobertura de dominio alem do minimo
- Integracao real com Supabase
- Frontend Angular robusto com autenticacao e validacoes
- Pipeline de CI ja operacional

Com os ajustes finais de reforco de seguranca por JWT no backend, o projeto fica totalmente alinhado com os criterios de avaliacao de producao e qualidade profissional.
