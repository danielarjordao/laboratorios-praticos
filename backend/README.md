# Personal Finance Dashboard - Backend API

Bem-vindo ao repositório do backend do Gestor de Finanças Pessoais (MVP). Esta API RESTful foi desenvolvida para fornecer uma base sólida, tipada e segura para a gestão financeira, com foco na erradicação da pobreza (ODS 1).

## Tecnologias Utilizadas

* **Runtime:** Node.js (v24+)
* **Framework:** Express.js
* **Linguagem:** TypeScript (Tipagem Estrita)
* **Base de Dados:** PostgreSQL (via Supabase BaaS)
* **Arquitetura:** Padrão Controller-Service com ES Modules

## Documentação Detalhada

Para manter este repositório organizado e profissional, todos os detalhes arquiteturais e técnicos foram documentados em ficheiros dedicados na pasta `docs/`:

* **[Endpoints da API (Rotas e Funcionalidades)](docs/api-endpoints.md)**
* **[Esquema da Base de Dados (Tabelas e Relações)](docs/database-schema.md)**
* **[Decisões de Arquitetura (Justificações Técnicas)](docs/decisions.md)**

## Como Executar Localmente

### 1. Clona o repositório e acede à pasta do backend

```bash
git clone [teu-link-do-repo]
cd backend
```

### 2. Instala as dependências

```bash
npm install
```

### 3. Configura as variáveis de ambiente

Cria um ficheiro `.env` na raiz da pasta `backend` e adiciona as tuas credenciais do Supabase:

```env
PORT=3000
SUPABASE_URL=tua_url_aqui
SUPABASE_KEY=tua_service_role_key_aqui
```

### 4. Inicia o servidor em modo de desenvolvimento

```bash
npm run dev
```

O servidor estará a correr em `http://localhost:3000`.
