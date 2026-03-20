# Documento 4: Planeamento Estratégico Passo a Passo (Atualizado)

## Fase 1: Backend e Base de Dados (Sessões 1 a 4)

`Objetivo: Entrega TP1 (20% da nota)`

* **Passo 1:** Criar o repositório no GitHub. Configurar a estrutura base do projeto Node.js + Express.
* **Passo 2:** Criar o projeto no Supabase. Executar os scripts SQL definitivos (com índices, constraints e arquitetura SaaS de isolamento de perfis).
* **Passo 3:** Implementar os 5 endpoints obrigatórios para a tabela `transactions`. Desenvolver a camada de validação no Node.js para regras não cobertas pelo SQL (ex: verificar se `account_id` e `category_id` pertencem ao mesmo perfil, validar `installment_number <= total_parts`). Utilizar um `profile_id` fixo temporariamente.
* **Passo 4:** Escrever os 3 testes unitários focados estritamente na quebra de integridade (ex: testar se a API rejeita transferências com a mesma conta de origem e destino, ou despesas sem categoria).
* **Passo 5:** Fazer o deploy da API no Render.com. Documentar os endpoints no README e tirar screenshots do Postman. **(Submeter TP1)**.

## Fase 2: Frontend MVP (Sessões 5 a 8)

`Objetivo: Entrega TP2 (20% da nota)`

* **Passo 1:** Inicializar o projeto Angular. Configurar o *routing* para as 4 páginas obrigatórias (Login, Dashboard, Listagem, Formulário).
* **Passo 2:** Construir a interface utilizando CSS/SCSS nativo (Flexbox/Grid), aplicando a paleta de cores definida.
* **Passo 3:** Criar os *Services* no Angular para ligar o frontend à API Node.js em produção.
* **Passo 4:** Implementar formulários reativos dinâmicos com validações visíveis (ex: se o tipo selecionado for `TRANSFER`, a UI deve ocultar o campo de Categoria e exigir a Conta de Destino).
* **Passo 5:** Fazer o deploy do frontend (Vercel/Netlify). Gravar o vídeo de 30 segundos. **(Submeter TP2)**.

## Fase 3: Integração, Polimento e Defesa (Sessões 9 a 12)

`Objetivo: Defesa Final (60% da nota)`

* **Passo 1:** Implementar a autenticação (Supabase Auth - JWT) no frontend e proteger as rotas do backend. Substituir o `profile_id` fixo pelo ID derivado do utilizador autenticado.
* **Passo 2:** Configurar o GitHub Actions para CI/CD (Lint + Build) e garantir a "badge verde" no repositório.
* **Passo 3:** Fazer testes completos *end-to-end* com as versões em produção.
* **Passo 4:** Finalizar o README. Destacar a aplicação de conceitos de DDD (Domain-Driven Design), a arquitetura de validação no banco de dados e a ligação ao ODS 1.
* **Passo 5:** Preparar a defesa técnica presencial. Formular respostas para decisões de arquitetura de nível sénior (ex: explicar que a tabela `recurring_transactions` seria executada por um *Cron Job* agendado no backend).
