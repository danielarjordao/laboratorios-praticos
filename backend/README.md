# Personal Finance Dashboard - Backend API

Bem-vindo ao repositório do backend do Gestor de Finanças Pessoais (MVP). Esta API RESTful foi desenvolvida para fornecer uma base sólida, tipada e segura para a gestão financeira, com foco na erradicação da pobreza (ODS 1).

## Tecnologias Utilizadas

* **Runtime:** Node.js (v24+)
* **Framework:** Express.js
* **Linguagem:** TypeScript (Tipagem Estrita)
* **Base de Dados:** PostgreSQL (via Supabase BaaS)
* **Arquitetura:** Padrão Controller-Service com ES Modules

## Documentação do Projeto

Todos os detalhes técnicos e estruturais foram documentados em ficheiros separados para facilitar a leitura:

* [Esquema da Base de Dados (Tabelas e Relações)](../docs/database-schema.md)
* [Endpoints da API (Rotas e Funcionalidades)](../docs/api-endpoints.md)
* [Decisões de Arquitetura (Justificações Técnicas)](../docs/decisions.md)

## Como Executar Localmente

### 1. Clona o repositório e acede à pasta do backend

```bash
   cd backend
```

### 2. Instala as dependências

```bash
    npm install
```

### 3. Configura as variáveis de ambiente

* Cria um ficheiro `.env` na raiz da pasta `backend`.
* Adiciona as tuas credenciais do Supabase:

```bash
PORT=3000
SUPABASE_URL=tua_url_aqui
SUPABASE_KEY=tua_service_role_key_aqui
```

### 4. Inicia o servidor em modo de desenvolvimento

```bash
npm run dev
```

O servidor estará a correr em `http://localhost:3000`.
