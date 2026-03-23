# Documento de Decisões de Arquitetura (Backend)

**Projeto:** Gestor de Finanças Pessoais (SaaS)
**Foco:** ODS 1 (Erradicação da Pobreza)
**Fase:** V1 (MVP)

Este documento justifica as escolhas tecnológicas e estruturais estabelecidas na infraestrutura do backend para garantir segurança, escalabilidade e velocidade de desenvolvimento dentro do prazo estipulado (12 sessões).

## 1. Estrutura de Repositório (Monorepo)

* **Decisão:** Manter as pastas `backend`, `frontend` e `docs` na mesma raiz do repositório Git.
* **Justificação:** Reduz a fricção na gestão de dependências de integração. Permite que um único *commit* represente o estado completo da aplicação (ex: atualização da API acompanhada da respetiva alteração na interface). Facilita a configuração futura de *pipelines* de CI/CD (GitHub Actions).

## 2. Motor de Execução e Framework (Node.js + Express)

* **Decisão:** Utilização do Node.js (v24+) com o framework Express.
* **Justificação:** O ecossistema Node.js permite partilhar o mesmo paradigma (JavaScript/TypeScript) entre o backend e o frontend (Angular), reduzindo a carga cognitiva durante o desenvolvimento. O Express foi escolhido por ser minimalista, leve e sem opiniões rígidas, garantindo a entrega rápida dos endpoints RESTful obrigatórios do MVP sem o excesso de configuração de frameworks mais pesados (como NestJS).

## 3. Sistema de Módulos (ES Modules)

* **Decisão:** Adoção do standard moderno ES Modules (`"type": "module"` no `package.json` utilizando `import/export` em vez de `require()`).
* **Justificação:** Alinha perfeitamente a sintaxe do backend com a sintaxe que será obrigatoriamente exigida pelo Angular no frontend. O ESM é o standard atual do JavaScript, oferecendo melhor *scoping* temporal e resolução assíncrona de dependências nativa.

## 4. Base de Dados e Integração (Supabase / PostgreSQL)

* **Decisão:** Uso do `@supabase/supabase-js` para ligar a API diretamente a uma base de dados relacional PostgreSQL gerida.
* **Justificação:** Finanças exigem integridade transacional rigorosa (ACID), inviabilizando bases de dados NoSQL (como MongoDB) para este contexto. O Supabase atua como um BaaS (*Backend as a Service*), reduzindo a zero o esforço de DevOps com infraestrutura, e oferece um ecossistema pronto para a Fase 2 (Supabase Auth e *Row Level Security* para gestão multi-perfil).

## 5. Segurança e Variáveis de Ambiente

* **Decisão:** Isolamento de credenciais usando `dotenv` combinado com regras restritas no `.gitignore`.
* **Justificação:** Garante que o `Project URL` e a `API Key` do Supabase nunca são expostos no histórico de versionamento do GitHub. O código em produção acederá a estas chaves diretamente através das configurações de ambiente do servidor (Render.com).

## 6. Ferramentas de Desenvolvimento e DX (Developer Experience)

* **Decisão:** Inclusão do `nodemon` para reinicialização automática do servidor.
* **Justificação:** Com o limite rígido de tempo do projeto, a compilação e reinicialização manual do servidor a cada linha de código alterada consumiria horas valiosas. O `nodemon` automatiza este processo, permitindo um ciclo de *feedback* instantâneo durante o desenvolvimento da lógica de negócio.

## 7. Estratégia de Versionamento (GitFlow Simplificado)

* **Decisão:** Utilização de branches separadas (`main`, `develop`, e branches de funcionalidade como `feat/api-transactions`).
* **Justificação:** Protege a `main` (código de produção) de código quebrado ou em desenvolvimento. Demonstra maturidade técnica ao evitar programar diretamente na branch principal, garantindo que o que está na `main` está sempre pronto para ser compilado e publicado (Deploy).
