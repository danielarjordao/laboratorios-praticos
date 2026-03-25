# Documento de Decisões de Arquitetura (Backend)

**Projeto:** Gestor de Finanças Pessoais (SaaS)
**Foco:** ODS 1 (Erradicação da Pobreza)
**Fase:** V1 (MVP)

Este documento justifica as escolhas tecnológicas e estruturais estabelecidas na infraestrutura do backend para garantir segurança, escalabilidade e velocidade de desenvolvimento dentro do prazo estipulado.

## 1. Estrutura de Repositório (Monorepo)

* **Decisão:** Manter as pastas `backend`, `frontend` e `docs` na mesma raiz do repositório Git.
* **Justificação:** Reduz a fricção na gestão de dependências de integração. Permite que um único *commit* represente o estado completo da aplicação. Facilita a configuração futura de *pipelines* de CI/CD.

## 2. Motor de Execução e Linguagem (Node.js + Express + TypeScript)

* **Decisão:** Utilização do Node.js (v24+) com o framework Express, integralmente tipado com TypeScript.
* **Justificação:** O TypeScript foi introduzido para garantir tipagem estática, eliminando erros em tempo de execução (*runtime errors*) e garantindo que os contratos de dados (Interfaces) entre o Backend e o Angular (Frontend) sejam 100% compatíveis. O Express garante a entrega rápida dos endpoints RESTful sem o excesso de configuração de frameworks mais pesados.

## 3. Padrão de Arquitetura (Controller-Service Pattern)

* **Decisão:** Separação estrita de responsabilidades utilizando Rotas (`routes`), Controladores (`controllers`) e Serviços (`services`).
* **Justificação:** Aplicação direta do princípio "Single Responsibility" (SOLID). Os *Controllers* são responsáveis apenas por receber a requisição HTTP e validar dados (*fail-fast*), enquanto os *Services* contêm exclusivamente a lógica de negócio e as queries à base de dados. Isto torna o código modular, testável e fácil de manter.

## 4. Padronização de Interfaces e DTOs

* **Decisão:** Utilização do padrão `Create...DTO` para dados de entrada e `...Response` para dados de saída, com proibição absoluta do tipo `any`.
* **Justificação:** Garante previsibilidade. O Frontend sabe exatamente que propriedades enviar e o que vai receber. Evita que o TypeScript falhe ao mapear os dados devolvidos pelo Supabase, garantindo a integridade dos objetos (ex: `InstallmentPlanResponse` vs `TransactionResponse`).

## 5. Estratégia de Retenção de Dados (Soft Delete)

* **Decisão:** Nenhuma entidade principal é apagada fisicamente da base de dados (`DELETE FROM`). Em vez disso, utiliza-se a coluna `deleted_at` com *timestamps*.
* **Justificação:** Sendo um sistema financeiro, o histórico de dados é crítico. O *Soft Delete* previne a perda acidental de dados em cascata, mantém a integridade dos relatórios passados e permite a recuperação de informações caso o utilizador cometa um erro.

## 6. Base de Dados e Integração (Supabase / PostgreSQL)

* **Decisão:** Uso do `@supabase/supabase-js` para ligar a API diretamente a uma base de dados relacional PostgreSQL gerida com 11 tabelas.
* **Justificação:** Finanças exigem integridade transacional rigorosa (ACID). A base de dados foi desenhada com chaves estrangeiras (Foreign Keys) rigorosas. Na fase MVP, optou-se por focar na lógica relacional, planeando a ativação do RLS (*Row Level Security*) para a fase de produção, agilizando assim os testes de integração atuais.

## 7. Padronização de Nomenclatura CRUD

* **Decisão:** Todas as funções internas partilham a mesma taxonomia: `create`, `read`, `update` e `delete`.
* **Justificação:** Melhora drasticamente a *Developer Experience* (DX) e a legibilidade do código. Qualquer developer que entre no projeto sabe imediatamente como invocar uma operação, independentemente do domínio (seja `profiles`, `budgets` ou `transactions`).

## 8. Segurança e Tratamento de Erros (Tratamento Limpo)

* **Decisão:** Uso de variáveis de ambiente (`dotenv`) para esconder chaves, e tratamento de erros controlado usando `error: unknown` no TypeScript.
* **Justificação:**
  1. **Proteção de Chaves (`dotenv`):** A chave da base de dados (Supabase) funciona como a senha do cofre do projeto. Usar o `dotenv` com o ficheiro `.env` ignorado pelo Git garante que essa senha nunca vá parar à internet (GitHub).
  2. **Tratamento de Erros Limpo:** No TypeScript, quando um erro acontece (ex: a base de dados falha), não sabemos exatamente o formato desse erro. Em vez de usar `any` (que aceitaria qualquer coisa), usamos `unknown`. Isso obriga o nosso código a verificar se o erro é uma mensagem legível antes de a enviar para o Frontend.
  * **Exemplo prático:** Em vez de o ecrã do utilizador "rebentar" com um código de erro gigante do servidor (*stack trace*), ele recebe apenas uma mensagem limpa e segura, como: `{ "status": "error", "message": "Missing required fields" }`.

## 9. Sistema de Módulos (ES Modules)

* **Decisão:** Adoção do standard moderno ES Modules (`"type": "module"` utilizando `import/export`).
* **Justificação:** Alinha perfeitamente a sintaxe do backend com a sintaxe exigida pelo Angular no frontend, oferecendo melhor *scoping* temporal e resolução assíncrona de dependências nativa.

## 10. Estratégia de Versionamento (GitFlow)

* **Decisão:** Adoção do fluxo de trabalho GitFlow estruturado em três níveis de *branches*: `main`, `develop` e branches de funcionalidade (`feat/...`).
* **Justificação:** Este modelo demonstra alta maturidade na gestão do código.
  * A branch `main` é sagrada e representa apenas o código de **Produção** (a versão final que vai para os utilizadores).
  * A branch `develop` atua como o ambiente de **Integração/Testes**, onde as várias peças do projeto se juntam.
  * As branches `feat/` (ex: `feat/profiles-and-settings`) são usadas para criar as novidades sem o risco de partir o que já funciona. Todo o código novo passa por um *Pull Request* para a `develop` antes de, no fim do projeto, ir para a `main`.
