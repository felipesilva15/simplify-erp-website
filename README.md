# Simplify ERP

Painel web (frontend) de um sistema ERP, construído com **Angular**. O projeto conversa com uma **API REST externa** (não incluída neste repositório) que fornece autenticação, listas, cadastros, perfis de acesso, consultas (lookup) e exportação de dados.

Este documento é o ponto de entrada do repositório. A visão de produto está em [`docs/prd.md`](docs/prd.md) e a especificação técnica em [`docs/spec.md`](docs/spec.md). A seção **[Entregáveis e Definição de Pronto](docs/spec.md#entreg%C3%A1veis-e-defini%C3%A7%C3%A3o-de-pronto)** do `spec.md` descreve o que deve acompanhar qualquer mudança no projeto.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | [Angular](https://angular.dev) 21 (standalone components, signals, control flow moderno) |
| Linguagem | TypeScript ~5.9 |
| UI | [PrimeNG](https://primeng.org) 21 + PrimeFlex + PrimeIcons + Primeuix themes |
| Formulários / máscaras | Angular Forms reativo, [ngx-mask](https://www.npmjs.com/package/ngx-mask) |
| Testes | [Vitest](https://vitest.dev) + jsdom (runner integrado ao Angular CLI) |
| Lint | ESLint (angular-eslint + typescript-eslint) |

## Pré-requisitos

- **Node.js** (>= 20) e **npm** >= 11 (o projeto usa `npm@11.8.0` como gerenciador; há também um `bun.lock` no repositório, mas o Angular CLI está configurado para `npm` em `angular.json`).
- Angular CLI 21 (`npm i -g @angular/cli`).
- **API do ERP** em execução e alcançável em `http://localhost:8000/api` (padrão configurado nos environments).

## Instalação

```bash
npm install
```

## Configuração

A URL base da API é definida nos arquivos de ambiente (`file replacement` do build):

- `src/environments/environment.ts` — usado no build de produção.
- `src/environments/environment.development.ts` — usado no build/serve de desenvolvimento.

Hoje ambos apontam para `http://localhost:8000/api`:

```ts
export const environment = {
    baseUrlApi: 'http://localhost:8000/api'
};
```

Todas as chamadas HTTP usam `withCredentials: true` (autenticação por cookie), e não há token no `localStorage`.

## Scripts

```bash
npm start            # ng serve (dev server em http://localhost:4200)
npm run build        # ng build (build de produção, artefatos em dist/)
npm run watch        # build em watch (configuração development)
npm test             # testes unitários (Vitest), modo watch desativado
npm run test:coverage# testes unitários com relatório de cobertura (v8)
npm run lint         # ESLint
```

## Rodando em desenvolvimento

```bash
npm start
```

Abra `http://localhost:4200/`. O app recarrega automaticamente a cada alteração de código. A autenticação é necessária: sem sessão válida (cookie), ao carregar a aplicação você será redirecionado para `http://localhost:4200/security/auth/login`.

> Importante: sem a API de backend em `http://localhost:8000/api`, o login e as listagens não funcionam — a aplicação não possui dados mockados.

## Testes

Testes unitários ficam junto ao código-fonte em arquivos `*.spec.ts` (68 arquivos hoje). Para executar:

```bash
npm test
npm run test:coverage   # relatório de cobertura (text/json/html, exclui *.layout.html e *.page.html)
```

## Build

```bash
npm run build
```

Compila a aplicação para `dist/`. A configuração de produção aplica `outputHashing` e budgets (initial: warning 500kB / erro 1MB; anyComponentStyle: 4kB/8kB) definidos em `angular.json`.

> **Atenção**: hoje `npm run build` falha em `bundle initial exceeded maximum budget` (1.28 MB > 1 MB). É uma pendência pré-existente do projeto (o bundle inicial é dominado por PrimeNG e estilos globais; as rotas são lazy), não um problema de uma feature específica. Detalhes em [`docs/spec.md` — 18.1](docs/spec.md#181-padrões-verificados-no-projeto-fatos).

## Lint

```bash
npm run lint
```

Regras definidas em `eslint.config.mjs`. Destaques: componentes standalone obrigatórios, `ChangeDetectionStrategy.OnPush`, control flow moderno nos templates, regras de acessibilidade em templates e TypeScript estrito. Arquivos `*.spec.ts` recebem regras mais permissivas.

## Visão geral da estrutura

```
src/
├── main.ts                     # bootstrap do Angular (bootstrapApplication)
├── app/
│   ├── app.ts                  # componente raiz (splash screen, toast, confirm, drawer host)
│   ├── app.config.ts           # providers (router, http, PrimeNG, ngx-mask)
│   ├── app.routes.ts           # rotas raiz (auth, main layout, error, wildcard → 404)
│   ├── core/                   # camada transversal: auth, guards, contracts, models, services, config
│   │   ├── config/             # tema, menu, traduções PrimeNG, aliases de máscara
│   │   ├── contracts/          # interfaces de serviço (Crud, Lookup, Logable, Exportable, ChildEntityForm, ChildItemEditor)
│   │   ├── guards/             # appStartup, permission, pendingChanges
│   │   ├── interceptors/       # tratamento global de erros HTTP
│   │   ├── auth/               # AuthService e PermissionService
│   │   └── services/           # startup, loading, query builder, menu, datas, árvore, breakpoint
│   ├── features/               # módulos de funcionalidade (rotas lazy)
│   │   ├── security/           # auth (login), users, roles
│   │   ├── third-party/        # partners, partner-types, contacts (lista filha 1:N)
│   │   ├── configuration/      # module-service (consultado para permissões)
│   │   └── error/              # páginas de erro (403, 404, 500, 502, 503)
│   ├── layouts/                # shell aplicativo (main layout, navbar, sidebar) e error layout
│   └── shared/                 # componentes reutilizáveis (crud-list, lookup, child-entity-list, breadcrumb),
│                               # facades (crud-list/form, child-entity-list), ui wrappers, pipes, validators
├── assets/styles/              # estilos globais (variables, config, custom, global)
└── environments/               # environment.ts / environment.development.ts
```

Detalhes da arquitetura, contratos de API e fluxos estão em [`docs/spec.md`](docs/spec.md).

### Padrão de entidades filhas (1:N)

`shared/components/child-entity-list` + `ChildEntityListFacade` resolvem listas filhas editadas em memória e enviadas junto com o formulário pai (referência atual: `contacts` do `Partner`). O formulário do item é um componente `ChildEntityForm<T>` instanciado dinamicamente em um modal, e os erros da API voltam no padrão `arrayKey.indice[.campo]` (ex.: `contacts.2.name`), sendo normalizados pelo facade e exibidos na linha correspondente. A especificação completa está em [`docs/spec.md` — 7.5](docs/spec.md#75-listas-de-itens-filhos-1n--childentitylistfacadet--childentitylistcomponent).

## Requisito externo

- **API do ERP** (backend REST) em `http://localhost:8000/api` — autenticação por cookie (login, `/me`, logout), CRUD, lookups, activity-logs e exportação. O backend não faz parte deste repositório.