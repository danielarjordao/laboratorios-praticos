# Cronograma diário detalhado

## Fase 1: Backend e Base de Dados (Foco: TP1)

**Dia 23/03 (Segunda-feira) - Fundação da Infraestrutura:**

* **Manhã:** Criar repositório `dashboardFinancas-backend` no GitHub. Inicializar o projeto (`npm init -y`) e instalar dependências (`express`, `cors`, `@supabase/supabase-js`, `dotenv`).
* **Tarde:** Executar o script SQL final no Supabase. Configurar as variáveis de ambiente (`.env`) e criar a ligação à base de dados no Node.js. Testar se o servidor arranca sem erros.

**Dia 24/03 (Terça-feira) - O Motor Transacional (Parte 1):**

* **Manhã:** Criar o endpoint `POST /transactions`. Implementar a lógica rígida no Node.js (garantir valores absolutos, rejeitar transferências sem conta destino, verificar correspondência de perfil).
* **Tarde:** Criar o endpoint `GET /transactions` com suporte a filtros básicos na *query string* (mês, tipo).

**Dia 25/03 (Quarta-feira) - O Motor Transacional (Parte 2):**

* **Manhã:** Implementar os endpoints `GET /transactions/:id`, `PUT /transactions/:id` e `DELETE /transactions/:id`.
* **Tarde:** Testar todos os endpoints exaustivamente via Postman. Corrigir eventuais quebras lógicas.

**Dia 26/03 (Quinta-feira) - Testes e Deploy (Entrega TP1):**

* **Manhã:** Escrever 3 testes unitários focados na validação (ex: rejeição de despesas sem categoria).
* **Tarde:** Fazer o deploy do backend no Render.com. Capturar os *screenshots* do Postman e atualizar o README. **Submeter TP1.**

### Fase 2: Frontend MVP (Foco: TP2)

**Dia 27/03 (Sexta-feira) - Fundação do Frontend:**

* **Manhã:** Inicializar o projeto Angular (`ng new dashboardFinancas-frontend`). Limpar ficheiros padrão e configurar o *Routing* (Login, Dashboard, Lista, Formulário).
* **Tarde:** Criar os *Services* (HTTP Client) para conectar a aplicação Angular à sua API Node.js que já está a rodar no Render.com. Fechar a semana com a comunicação Frontend-Backend estabelecida.

**Dia 30/03 (Segunda-feira) - Interface e Estrutura:**

* **Manhã:** Estruturar o HTML/SCSS base usando Flexbox/Grid. Aplicar a paleta de cores (Dark Slate Grey, Pearl Aqua, Burnt Peach).
* **Tarde:** Construir os componentes visuais do Dashboard (cartões de resumo) e a Tabela de Listagem de Transações.

**Dia 31/03 (Terça-feira) - Interatividade e Formulários:**

* **Manhã:** Implementar os *Reactive Forms* do Angular para o formulário de transações.
* **Tarde:** Adicionar as validações visuais do formulário (ex: esconder a *drop-down* de Categorias se o utilizador selecionar "Transferência" e exibir a seleção de Conta Destino).

**Dia 01/04 (Quarta-feira) - Deploy e Demo (Entrega TP2):**

* **Manhã:** Testes locais da interface. Correção de bugs visuais e garantia de que o CRUD funciona de ponta a ponta.
* **Tarde:** Fazer o deploy na Vercel ou Netlify. Gravar a demonstração em vídeo de 30 segundos. **Submeter TP2.**

### Fase 3: Segurança, CI/CD e Polimento (Foco: Defesa Final)

**Dia 02/04 (Quinta-feira) - Segurança e Automação:**

* **Manhã:** Integrar o Supabase Auth (JWT) no Angular. Remover o ID de perfil fixo que foi usado nos testes e passar a enviar o *token* real nas requisições.
* **Tarde:** Configurar os *workflows* do GitHub Actions (CI/CD) para garantir a verificação automática de *Lint* e *Build* no repositório.

**Dia 06/04 (Segunda-feira) - Polimento Final e Defesa:**

* **Manhã:** Testes *end-to-end* rigorosos em produção. Redação final do README (destacar o *Domain-Driven Design* e o impacto no ODS 1).
* **Tarde:** Preparar as respostas para a defesa técnica. Estruturar os argumentos sobre arquitetura, validações a nível de base de dados e visão futura para a automação de ocorrências (Cron Jobs).

**Dia 07/04 (Terça-feira) - O Dia da Entrega:**

* **Manhã:** Submissão do código final e apresentação técnica presencial.
