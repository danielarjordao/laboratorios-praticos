# Resumo do Plano do Projeto (Arquitetura SaaS)

**Nome de Código do Projeto:** `dashboardFinancas`
**Tema:** ODS 1 (Erradicação da Pobreza) – Literacia financeira, estabilidade e independência.

## 1. Objetivo

Construir um SaaS de finanças pessoais escalável, multi-perfil e desenhado com foco em integridade de dados. A missão central é dar aos utilizadores clareza absoluta sobre os seus recursos através de um sistema que previne anomalias financeiras, promovendo a independência e a tomada de decisões conscientes.

## 2. Princípios de Arquitetura (DDD-Lite)

* **Isolamento de Contexto:** Separação estrita entre Identidade (User), Contexto (Profile) e Execução (Transactions). Categorias, contas, orçamentos e tags pertencem exclusivamente a um perfil, impossibilitando o vazamento de dados.
* **Integridade Transacional:** Regras de negócio trancadas ao nível da base de dados (PostgreSQL Constraints) garantem valores financeiros sempre positivos, validam a lógica de transferências entre contas e previnem duplicações.

## 3. Estratégia de Execução

* **V1 (MVP Académico - 12 Sessões):** Foco na entrega dos requisitos obrigatórios (5 endpoints RESTful e interface em Angular). Utilização de um ID de perfil fixo temporário para desenvolvimento. O backend (Node.js) atua como barreira de segurança, executando a validação lógica complexa (validação de números de parcelas, verificação de hierarquia de categorias e correspondência de perfis) antes de comunicar com a base de dados.
* **V2 (Produto Real / Portfólio):** Integração do Supabase Auth (JWT) no frontend, ativação da troca dinâmica de perfis (ex: Pessoal vs. Casal), automatização das transações recorrentes através de *Cron Jobs* executados pelo servidor, e gestão avançada de planos de parcelamento.

## 4. Stack Tecnológica

* **Frontend:** Angular 12+ (TypeScript) com deploy na Vercel ou Netlify.
* **Backend:** Node.js 24+ com Express com deploy no Render.com (incluindo camada de validação de domínio).
* **Base de Dados e Autenticação:** Supabase Cloud (PostgreSQL relacional gerido) e Supabase Auth.
* **CI/CD e Versionamento:** Git, GitHub Actions (Lint + Build), ramo `main` protegido.
