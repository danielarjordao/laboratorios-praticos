# Planeamento Estratégico do Projeto

## Fase 1: Backend e Base de Dados (Sessões 1 a 4)
`Objetivo: Entrega TP1 (20% da nota)`

* **Passo 1:** Criar o repositório no GitHub. Configurar a estrutura base do projeto Node.js + Express num formato de Monorepo.
* **Passo 2:** Criar o projeto no Supabase. Executar os scripts SQL definitivos (com índices, constraints e arquitetura de tabelas preparadas para isolamento de perfis).
* **Passo 3:** Implementar os 5 endpoints obrigatórios para a tabela `transactions`. Desenvolver a camada de validação no Node.js para regras não cobertas pelo SQL (ex: verificar se `account_id` e `category_id` pertencem ao mesmo perfil, validar `installment_number <= total_parts`). Utilizar um `profile_id` fixo temporariamente.
* **Passo 4:** Escrever os 3 testes unitários focados estritamente na quebra de integridade (ex: testar se a API rejeita transferências sem conta de destino).
* **Passo 5:** Fazer o deploy da API no Render.com. Documentar os endpoints no README e tirar screenshots do Postman. *(Submetido TP1)*.

## Fase 2: Frontend MVP (Sessões 5 a 8)
`Objetivo: Entrega TP2 (20% da nota)`

* **Passo 1:** Inicializar o projeto Angular. Configurar o *routing* para as 4 páginas obrigatórias (Login, Dashboard, Listagem, Formulário).
* **Passo 2:** Construir a interface utilizando CSS/SCSS nativo (Flexbox/Grid), garantindo responsividade mobile até 320px.
* **Passo 3:** Criar os *Services* no Angular para ligar o frontend à API Node.js em produção.
* **Passo 4:** Implementar formulários reativos dinâmicos com validações visíveis (ex: se o tipo selecionado for `TRANSFER`, a UI deve ocultar o campo de Categoria e exigir a Conta de Destino).
* **Passo 5:** Fazer o deploy do frontend (Vercel/Netlify). Gravar o vídeo de 30 segundos. *(Submetido TP2)*.

## Fase 3: Integração, Polimento e Defesa (Sessões 9 a 12)
`Objetivo: Defesa Final (60% da nota)`

* **Passo 1:** Implementar a autenticação (Supabase Auth) no frontend para gestão de sessões. Substituir o `profile_id` fixo pela gestão dinâmica de *Workspaces* na interface.
* **Passo 2:** Configurar o GitHub Actions para CI/CD (Lint + Build) e garantir a "badge verde" no repositório principal.
* **Passo 3:** Fazer testes completos *end-to-end* com as versões em produção, garantindo estabilidade dos filtros de listagem.
* **Passo 4:** Finalizar o README e a documentação. Destacar a aplicação do padrão *Controller-Service*, a Estratégia de Compensação de saldos e a ligação ao ODS 1.
* **Passo 5:** Preparar a defesa técnica presencial. Formular respostas para decisões de arquitetura e demonstrar a estabilidade do CRUD completo em produção.
