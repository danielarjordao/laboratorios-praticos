# Fase 1: Backend Avançado e Base de Dados (Foco: TP1)

**Dia 24/03 (Terça-feira) - Funcionalidades Secundárias e Lógica Complexa:**

* **Manhã:** Implementar o CRUD de *Tags* e a lógica de associação com as Transações (`transaction_tags`).
* **Tarde:** Desenvolver a lógica de *Installment Plans* (Planos de Parcelamento), garantindo o cálculo e a criação automática de múltiplas transações futuras com base no número de parcelas.

**Dia 25/03 (Quarta-feira) - Orçamentos, Metas e Qualidade:**

* **Manhã:** Criar os endpoints para *Budgets* (Orçamentos) e *Goals* (Metas de Poupança).
* **Tarde:** Implementar testes unitários focados nas regras de negócio críticas (ex: validação da reconciliação de saldos, bloqueio de deleção de contas). Revisão de código e limpeza.

**Dia 26/03 (Quinta-feira) - Deploy e Documentação (Entrega TP1):**

* **Manhã:** Configurar o deploy do backend no Render.com e conectar à base de dados de produção. Testar os endpoints via Postman contra o servidor na nuvem.
* **Tarde:** Atualizar o README com instruções detalhadas de instalação e rotas. **Submeter TP1.** Encerramento das atividades do dia para descanso.

## Fase 2: Frontend MVP (Foco: TP2)

**Dia 27/03 (Sexta-feira) - Fundação do Frontend e Conexão:**

* **Manhã:** Inicializar o projeto Angular (`ng new dashboardFinancas-frontend`). Estruturar o *Routing* (Login, Dashboard, Transações) e configurar o ambiente visual base.
* **Tarde:** Criar os *Services* (HTTP Client) no Angular e estabelecer a comunicação bidirecional com a API Node.js alojada no Render.com.

**Dia 30/03 (Segunda-feira) - Interface e Estrutura Visual:**

* **Manhã:** Estruturar o *layout* principal usando Flexbox/Grid e aplicar o sistema de cores do projeto.
* **Tarde:** Construir os componentes visuais de leitura: Cartões de resumo do Dashboard (Saldo, Receitas, Despesas) e a Tabela de Listagem.

**Dia 31/03 (Terça-feira) - Formulários e Interatividade:**

* **Manhã:** Implementar *Reactive Forms* para as operações de criação e edição (Contas, Categorias e Transações).
* **Tarde:** Adicionar validações visuais dinâmicas (ex: ocultar campo de conta de destino se o tipo não for transferência) e exibição de alertas de sucesso/erro vindos da API.

**Dia 01/04 (Quarta-feira) - Deploy Frontend e Demo (Entrega TP2):**

* **Manhã:** Testes *End-to-End* locais (fluxo completo: criar conta -> criar categoria -> registar transação -> verificar dashboard).
* **Tarde:** Fazer o deploy do frontend na Vercel ou Netlify. Gravar a demonstração em vídeo (30 segundos). **Submeter TP2.**

### Fase 3: Segurança, CI/CD e Polimento (Foco: Defesa Final)

**Dia 02/04 (Quinta-feira) - Segurança e Automação:**

* **Manhã:** Integrar a autenticação JWT. Atualizar o Backend para extrair o ID do perfil diretamente do *token* seguro, substituindo o envio manual nas requisições.
* **Tarde:** Configurar *workflows* do GitHub Actions (CI/CD) para automatizar a verificação de código (*Lint*) e os processos de *Build*.

**Dia 03/04 (Sexta-feira) - Funcionalidades Opcionais e Ajustes:**

* **Manhã:** Implementar a lógica de *Recurring Transactions* (Transações Recorrentes) ou refinar a interface de utilizador.
* **Tarde:** Buffer dedicado para resolução de bugs residuais ou encerramento antecipado da semana de estudos.

**Dia 06/04 (Segunda-feira) - Preparação Estratégica para Defesa:**

* **Manhã:** Testes exaustivos no ambiente de produção. Revisão final da documentação (enfoque nas decisões arquiteturais e impacto prático).
* **Tarde:** Estruturação dos argumentos técnicos para a apresentação, destacando soluções como o *Soft Delete* e a reconciliação matemática de saldos.

**Dia 07/04 (Terça-feira) - Entrega e Apresentação:**

* **Manhã:** Submissão final do código e defesa técnica presencial.
