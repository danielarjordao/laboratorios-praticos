# Cronograma Diário (Sprints)

## Fase 1: Backend e Base de Dados (Foco: TP1) - CONCLUÍDO

**Dia 20/03:**
* Inicialização do backend com `package.json` e `tsconfig.json`.
* Adição de `.gitignore`.
* Criação de documentação inicial (Schema da base de dados, endpoints da API e planeamento estratégico).

**Dia 23/03:**
* Setup inicial do servidor Express e integração do SDK do Supabase.
* Adição do pipeline de CI (GitHub Actions) para *linting* (ESLint + TypeScript).
* Implementação do CRUD base: rotas e controllers para Contas (`Accounts`), Categorias (`Categories`) e Transações (`Transactions`).
* Aplicação de tipagem e tratamento padronizado de erros.

**Dia 24/03:**
* Implementação da gestão de Etiquetas (`Tags`) e Planos de Parcelamento (`Installment Plans`).
* Implementação das rotas de Orçamentos (`Budgets`) e do Dashboard Summary.
* Criação da lógica de atualização e compensação automática de saldo das contas através do `AccountService`.

**Dia 25/03 (Entrega TP1):**
* Criação de endpoints de Metas (`Goals`), Perfis (`Profiles`) e Configurações (`User Settings`).
* Refatoração de nomenclaturas de controladores e serviços para padronização.
* Orquestração com Docker (`Dockerfile` e `docker-compose.yml`).
* Inicialização do projeto base em Angular (Frontend).

## Fase 2: Frontend MVP (Foco: TP2) - CONCLUÍDO

**Dia 26/03:**
* Configuração do *Routing* no Angular com caminhos iniciais.
* Implementação do *layout* estrutural: Navegação, Sidebar Responsiva, Header e Footer.
* Adição do botão de *toggle* e lógica funcional para *Dark Mode*.

**Dia 27/03:**
* Configuração do Supabase Auth na interface de Login.
* Implementação de proteções de rota (`AuthGuard` e `GuestGuard`).
* Criação dos primeiros formulários no componente de Perfil.

**Dia 30/03:**
* Criação dos *Services* de comunicação HTTP (Auth, Account, Category, Profile, Tag, Transaction).
* Implementação do UI de gestão de transações com filtros dinâmicos e paginados.
* Criação do formulário reativo para criação/edição de novas transações com associação de *Tags*.

**Dia 31/03:**
* Implementação de modais globais de confirmação (`ConfirmModal`) para ações destrutivas.
* Adição de *Loading Indicators* globais para *feedback* visual das chamadas HTTP.
* Validações rigorosas de domínio replicadas nos controladores do backend (Fail-fast).
* Funcionalidade de exportação de dados para CSV.

**Dia 01/04 (Entrega TP2):**
* Implementação de restrições visuais de navegação para rotas bloqueadas.
* Refinamentos globais de layout (Footer, Grid do Dashboard).
* Criação do `README.md` inicial com instruções detalhadas.

## Fase 3: UI/UX, CI/CD e Polimento (Foco: Defesa Final) - CONCLUÍDO

**Dia 02/04:**
* Deploy da API com configuração restrita de CORS para os domínios de produção.
* Configuração do *pipeline* de CI/CD completo (GitHub Actions) com *Linting*, *Build* e *Testing* automatizado (Vitest).
* Criação de testes unitários para os serviços críticos (`TransactionService` com mocks do Supabase).
* Unificação dos *breakpoints* de *Media Queries* para 768px, garantindo a fundação da responsividade.

**Dia 06/04:**
* Correções de responsividade para ecrãs *Mobile* (320px): Ajuste de `max-width`, *paddings*, eliminação de *scroll* horizontal indesejado.
* Remoção de fundos estáticos e injeção dinâmica de cores via CSS nas Categorias (`[style.backgroundColor]`).
* Implementação do botão "Voltar" nativo do navegador na interface.
* Auditoria final à documentação e clarificação dos documentos de arquitetura.

**Dia 07/04:**
* Apresentação e defesa final do projeto.
