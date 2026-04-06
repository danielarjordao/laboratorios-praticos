# Gestor de Finanças Pessoais (MVP)

[![CI Pipeline](https://github.com/danielarjordao/FinanceApp/actions/workflows/ci.yml/badge.svg)](https://github.com/danielarjordao/FinanceApp/actions/workflows/ci.yml)

Uma ferramenta digital desenvolvida para promover a literacia financeira, permitindo aos utilizadores um controlo rigoroso, rápido e acessível das suas receitas, despesas e saldo. Sem complicação e sem ligações bancárias automáticas — apenas clareza absoluta sobre o próprio dinheiro para apoiar decisões financeiras conscientes.

**Foco do Projeto:** ODS 1 — Erradicação da Pobreza.
*O projeto contribui para este objetivo ao oferecer uma ferramenta gratuita e educativa que ajuda os jovens (e o público em geral) a ganharem controlo sobre o seu dinheiro, evitando o endividamento e promovendo a estabilidade financeira.*

## Demonstração da Aplicação
![Demonstração do Gestor de Finanças](./docs/assets/apresentacao-gif.gif)`

**URLs de Produção:**

  * **Frontend (Aplicação):** [Aceder ao Gestor de Finanças](https://financeapp-daniela.vercel.app/)
  * **Backend (API):** [Render](https://financeapp-c4i9.onrender.com)

## Stack Tecnológica

O projeto adota uma arquitetura full-stack, gerida num formato de **Monorepo** para facilitar o versionamento, testes e deploy contínuo.

| Camada | Tecnologia Principal | Hospedagem / Serviço |
| :--- | :--- | :--- |
| **Frontend (UI/UX)** | Angular 21, TypeScript, RxJS, CSS3 | Vercel |
| **Backend (API)** | Node.js 24+, Express.js, TypeScript | Render.com |
| **Base de Dados** | PostgreSQL (Relacional) | Supabase Cloud |
| **Autenticação** | Supabase Auth (JWT) | Supabase Cloud |
| **CI/CD & Source Control**| Git, GitHub Actions | GitHub |

## Funcionalidades Implementadas

  * **Autenticação Segura:** Registo, login e gestão de sessão geridos de forma segura via Supabase Auth.
  * **Dashboard Resumo:** Visualização instantânea do Saldo Total, Receitas e Despesas do mês ativo.
  * **Isolamento de Dados:** Cada utilizador e perfil de trabalho (Workspace) tem acesso estrito apenas às suas próprias transações.
  * **CRUD Completo Reativo:** Criação, leitura, edição e eliminação de transações financeiras, categorias e contas com feedback visual imediato.
  * **Responsividade:** Interface fluida garantida desde ecrãs desktop até dispositivos móveis antigos.
  * **Filtros e Pesquisa:** Motor de filtragem por mês, ano, conta, categoria e tipo, processado de forma paginada e otimizada pelo servidor.
  * **UI/UX Dinâmica:** Injeção de cores personalizadas das categorias a partir da base de dados, validações visuais de formulários e modais de confirmação contra ações destrutivas.

## Decisão de Design

**A Escolha Técnica:** Implementação de *Soft Delete* e Estratégia de Compensação de Saldos.

**Porquê?**
Tratando-se de um sistema financeiro, a integridade dos dados e a rastreabilidade são críticas. Se permitíssemos o "Hard Delete" (apagar diretamente a linha da base de dados PostgreSQL) de uma transação, perderíamos o histórico de movimentos passados do utilizador.

Em vez disso, decidi implementar uma estratégia de **Soft Delete**:

1.  Quando uma transação é "apagada", o backend apenas marca a coluna `deleted_at` com o timestamp atual.
2.  Em simultâneo, o backend aplica uma **Estratégia de Compensação** contábil: se o utilizador apagar uma despesa antiga de 50€, a API devolve automaticamente esse valor ao saldo da conta correspondente, garantindo que as contas batem sempre certo sem necessitar de recalcular todo o histórico.

Esta decisão separa claramente as responsabilidades: o frontend entrega a experiência fluida (escondendo a transação), enquanto o backend garante a verdade matemática e a auditoria do dado.

## Como Executar o Projeto Localmente

O projeto está dividido em duas pastas principais (`/frontend` e `/backend`). Para correr a aplicação na tua máquina, segue estes passos:

### 1\. Clonar o Repositório

```bash
git clone [link-do-teu-repositorio]
cd [nome-da-pasta-do-projeto]
```

### 2\. Configurar Variáveis de Ambiente (Backend)

Navega para a pasta do backend, copia o ficheiro de exemplo e preenche as tuas credenciais do Supabase.

```bash
cd backend
cp .env.example .env
```

**Exemplo do `.env.example`:**

```env
PORT=3000
SUPABASE_URL=https://teu-projeto.supabase.co
SUPABASE_KEY=tua-service-role-key-aqui
```

### 3\. Iniciar a API (Backend)

Ainda na pasta `backend`, instala as dependências e inicia o servidor:

```bash
npm install
npm run dev
```

A API ficará a correr em `http://localhost:3000`.

### 4\. Iniciar a Aplicação (Frontend)

Abre um novo terminal, navega para a pasta do frontend, instala as dependências e inicia o Angular:

```bash
cd frontend
npm install
ng serve
```

A aplicação abrirá no teu navegador no endereço `http://localhost:4200`.

## Documentação Adicional

Para detalhes arquiteturais profundos, consulta os documentos complementares na pasta `/docs`:

  * [Arquitetura e Endpoints da API](https://www.google.com/search?q=./docs/api-endpoints.md)
  * [Esquema Relacional da Base de Dados](https://www.google.com/search?q=./docs/database-schema.md)
  * [Decisões e Regras de Negócio](https://www.google.com/search?q=./docs/decisions.md)

