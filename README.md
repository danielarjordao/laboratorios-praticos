# Personal Finance Dashboard (MVP)

> **Foco do Projeto:** ODS 1 - Erradicação da Pobreza.
> *Uma ferramenta digital desenhada para promover a literacia financeira, permitindo um controlo rigoroso e acessível de receitas, despesas e planeamento a longo prazo.*

Este repositório contém o código-fonte completo (Full-Stack) do Gestor de Finanças Pessoais. O projeto adota uma estrutura de **Monorepo**, concentrando tanto a interface de utilizador (Frontend) como a API e base de dados (Backend) num único local para facilitar o versionamento e a integração.

## Estrutura do Repositório (Monorepo)

O projeto está dividido em dois ecossistemas principais, cada um com as suas próprias dependências, scripts e documentação detalhada:

* **[`/frontend`](./frontend/)**: Aplicação Single Page (SPA) desenvolvida em **Angular (v18+)**. Responsável por toda a interface reativa, rotas protegidas e consumo da API.
* **[`/backend`](./backend/)**: API RESTful desenvolvida em **Node.js (v24+) com Express e TypeScript**. Responsável pela lógica de negócio, validação de dados e comunicação com a base de dados relacional **PostgreSQL (Supabase)**.
* **[`/docs`](./docs/)**: Documentação técnica aprofundada, incluindo diagramas de base de dados, endpoints da API e decisões de arquitetura.

```bash
cd backend
npm install
npm run dev
```

*(A API ficará disponível em `http://localhost:3000`. Consulta o [README do Backend](./backend/README.md) para detalhes de arquitetura, endpoints e scripts).*

### 2. Iniciar o Frontend (UI)

```bash
cd frontend
npm install
ng serve
```

*(A interface ficará disponível em `http://localhost:4200`. Consulta o [README do Frontend](./frontend/README.md) para detalhes de arquitetura, funcionalidades implementadas e roadmap).*
