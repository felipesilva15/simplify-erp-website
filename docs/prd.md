# PRD — Simplify ERP (painel web)

> Documento de produto (visão de negócio). A especificação técnica correspondente está em [`spec.md`](spec.md).

## 1. Propósito

O **Simplify ERP** é a interface web (frontend) de um sistema ERP. Ele dá aos usuários acesso a módulos de gestão por meio de um painel autenticado, com listagens filtradas e ordenáveis, cadastros em formulários, controle de permissões por perfil de acesso e exportação de dados.

O repositório contém **apenas o frontend**. Todo o processamento de negócio e a persistência são responsabilidade de uma **API REST externa** consumida por este painel.

## 2. Problema e contexto

A operação de negócio precisa de um ponto único, web e responsivo, para gerenciar dados estruturais e operacionais de forma segura: cadastro de usuários e perfis, controle granular de permissões, gestão de parceiros (clientes/fornecedores e seus tipos) e, futuramente, catálogo de produtos. Sem autenticação por perfil, qualquer pessoa autenticada teria acesso a tudo; sem listagens com busca/filtro, a operação depende de navegação manual em grandes volumes de dados.

## 3. Objetivos

- Oferecer um painel autenticado e responsivo para gestão dos módulos do ERP.
- Garantir que cada ação (ver, criar, editar, excluir, definir permissões) seja controlada por permissões, por usuário e por perfil.
- Padronizar a experiência de listagem (filtros, ordenação, paginação, exportação) e de formulário (criar/editar/visualizar) entre os módulos.
- Permitir rastreabilidade por meio de histórico de atividade (activity logs) nas entidades que a API expõe.
- Manter a interface 100% em português (pt-BR) e o domínio de negócio brasileiro (CPF/CNPJ, telefones, PIX, inscrições estaduais, etc.).

## 4. Usuários e consumidores

- **Usuários autenticados do ERP**: operam os módulos conforme as permissões atribuídas aos seus perfis (acesso com visualização, criação, edição e/ou exclusão).
- **Administradores**: usuários com permissão equivalente a `*` (ou permissões amplas), responsáveis por gerenciar usuários, perfis e permissões.
- **API do ERP (backend)**: único serviço externo consumido; não é usuário final, mas é o provedor de todos os dados.

## 5. Funcionalidades

### 5.1 Autenticação e sessão

- Login com usuário e senha (`/security/auth/login`); sessão autenticada por **cookie** (all HTTP com `withCredentials`).
- Carga do usuário atual (`GET /security/auth/me`) na inicialização da aplicação.
- Logout com confirmação e redirecionamento para a tela de login.
- Exibição do usuário autenticado na navbar.

### 5.2 Segurança — Usuários

- Listar usuários (tabela com paginação, ordenação e filtros), com menu de ações por registro.
- Criar, editar e visualizar usuário (`/security/users`, `new`, `:id/edit`, `:id`).
- Atribuir múltiplos perfis ao usuário e marcar como administrador.
- Consulta de usuário por ID e histórico de atividade, quando a API oferecer.
- Senha e confirmação de senha apenas na criação (no modo edição esses campos são ignorados).

### 5.3 Segurança — Perfis (roles) e permissões

- Listar perfis; criar, editar e visualizar perfil (em diálogo).
- **Definir permissões de um perfil** (`/security/roles/:id/permissions`): árvore de módulos → recursos → permissões, com seleção parcial herdada para nós pais.

### 5.4 Terceiros — Parceiros

- Listar parceiros com filtros por tipo de parceiro, tipo de pessoa, contribuinte, tipo de chave PIX e documento.
- Criar, editar e visualizar parceiro com formulário extenso: dados básicos, dados da pessoa/empresa, inscrições, filiação e chave PIX.
- Regras de negócio dinâmicas conforme o tipo de pessoa (ver seção 6).
- Consultas (lookup) e exportação (Excel/CSV).

### 5.5 Terceiros — Tipos de parceiro

- Listar tipo de parceiro (nome e código); criar, editar e visualizar em diálogo.
- Usado como lookup na listagem e no formulário de parceiros.

### 5.6 Catálogo (em construção)

- Item "Produtos" presente no menu (`/catalog/products`) **sem rota implementada** ainda (navegar gera a página de erro 404).

### 5.7 Configurações (em construção)

- Item "Configurações" no menu (`/configurations`, permissão `core.configurations`) **sem rota implementada** ainda.

### 5.8 Transversal

- **Navegação**: sidebar (menu filtrado por permissão), navbar (usuário/logout), breadcrumbs.
- **Listagens padrão**: colunas sortable, paginação, seleção, modo mobile (cards), menu de contexto e de ações, filtros configuráveis por campo (operadores `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `like`) e exportação.
- **Formulários padrão**: modos criar/editar/visualizar, validação no cliente, exibição de erros de validação do servidor campo a campo, avisos (warnings) e bloqueio de edição quando a API indicar.
- **Diálogos e drawers**: CRUDs leves em diálogos modais (rotas-dialog) e painéis laterais (drawers), com histórico de atividade em drawer.
- **Tratamento de erros**: páginas dedicadas para 403, 404, 500, 502 e 503.

## 6. Casos de uso principais

| # | Caso de uso | Ator | Fluxo resumido |
|---|---|---|---|
| 1 | Fazer login | Usuário | Informa usuário/senha → API valida → navega para `/` (no código atual o `redirectLink` nunca é preenchido a partir da URL — sempre vazio — portanto o destino é sempre `/`). |
| 2 | Acessar módulo com permissão | Usuário autenticado | A rota é guardada por `permissionGuard`; sem a permissão, é redirecionado para `/error/403`. O menu já oculta itens sem permissão. |
| 3 | Listar registros | Usuário com `*.viewAny` | Tabela carregada via lazy load; aplica filtros, ordenação e paginação; menu de exportação (Excel/CSV) quando disponível. |
| 4 | Criar/editar/visualizar registro | Usuário com `*.create`/`*.update`/`*.view` | Formulário em página (users, partners) ou diálogo (roles, partner-types); validações; em caso de erro de API, mensagens por campo. |
| 5 | Excluir registro | Usuário com `*.delete` | Confirmação (dialog) → `DELETE` → remove da listagem. |
| 6 | Definir permissões de um perfil | Usuário com `roles.definePermissions` | Abre árvore de módulos/recursos/permissões → marca/desmarca → envia lista de IDs de permissões (`PATCH /permissions`). |
| 7 | Consultar (lookup) | Qualquer formulário/listagem que use lookup | Digita termo → sugestões via `GET /<recurso>/lookup?q=` → seleciona item `{key,label,...}`. |
| 8 | Exportar dados | Usuário com permissão de exportação | Escolhe formato no menu → `GET /<recurso>/export` → download do arquivo no navegador. |
| 9 | Ver histórico de atividade | Usuário em uma tela de detalhe/form | Abre drawer "Histórico de atividade" com logs agrupados por dia (Hoje/Ontem/data) via `GET /<recurso>/:id/activity-logs`. |

## 7. Regras de negócio

Confirmadas pelo código (frontend):

1. **Permissões por ações**: toda rota de listagem/formulário exige uma permissão específica (`roles.viewAny`, `roles.create`, `roles.edit`, `roles.view`, `roles.definePermissions`, `users.*`, `partners.*`, `partnerTypes.*`). A permissão coringa `*` no usuário libera todas (`PermissionService.has`).
2. **Menu filtrado por permissão**: itens sem permissão não aparecem no menu; submenus sem itens permitidos são removidos.
3. **Parceiro — tipo de pessoa** (`partner-form.page.ts`):
   - **Pessoa física**: `taxpayer_type`, inscrições (estadual/municipal/suframa) são desabilitadas e zeradas; gênero se torna obrigatório.
   - **Empresa**: campos de pessoa física (documento de identidade/orgão emissor, estado civil, filiação, gênero) são desabilitados e zerados.
   - **Contribuinte**: inscrição estadual torna-se obrigatória (e obrigatória apenas para contribuinte).
4. **Usuário**: nome e email obrigatórios; senha e confirmação obrigatórias apenas na criação (`user-form.page.ts`).
5. **Datas**: campos de data viajam como `YYYY-MM-DD` (ISO) para a API e são convertidos para `Date` na carga (`DateUtilsService`).
6. **Lookups enviam chave**: ao submeter, itens de lookup são convertidos para `key` (ou formam o `meta` no caso multi) antes do payload (`unwrapLookups`).
7. **Bloqueio de edição por meta**: se a API responder `meta.editable = false` no modo edição, o formulário é desabilitado (`crud-form.facade.ts`).
8. **Modo visualização bloqueia o formulário**.
9. **Saída com alterações não salvas** pede confirmação (`pendingChangesGuard` usa `facade.canDeactivate`).

## 8. Requisitos funcionais (resumo)

- Aplicação web SPA responsiva em pt-BR.
- Autenticação por cookie redirecionando para login quando não autenticado.
- Navegação por módulos com proteção de rota por permissão.
- CRUD completo (listar/criar/editar/visualizar/excluir) para os módulos implementados (ver seção 5).
- Listagens com filtro por operadores, ordenação por coluna, paginação server-side e exportação Excel/CSV.
- Lookup (autocomplete) para selecionar entidades relacionadas (perfil no usuário, tipo de parceiro no parceiro).
- Histórico de atividade por entidade (quando a API implementa `LogableService`).
- Páginas de erro amigáveis para 403/404/500/502/503.

## 9. Requisitos não funcionais

| Categoria | Requisito observado |
|---|---|
| Performance | Lazy loading de rotas (`loadChildren`/`loadComponent`); paginação server-side; `OnPush` em componentes; budgets de bundle no build. |
| Segurança | Permissões no cliente + guardas de rota; nenhum token em `localStorage` (cookie); global error handler no browser. |
| Acessibilidade | Regras de acessibilidade de templates ativadas no ESLint (alt-text, labels, aria). |
| Manutenibilidade | Camadas `core` / `features` / `shared` / `layouts`; contratos em `core/contracts`; facades reutilizáveis para listagem/formulário. |
| Qualidade | 65 arquivos de teste `*.spec.ts` (Vitest), lint com TypeScript estrito. |
| Idioma | Interface e mensagens sempre em pt-BR. |

## 10. Integrações

- **API REST do ERP** (única). Base: `http://localhost:8000/api` (definida em `src/environments/`). Contratos consumidos (endpoints, envelope de resposta, paginação, lookup, exportação e activity-logs) estão detalhados no [`spec.md`](spec.md#integra%C3%A7%C3%A3o-com-a-api).
- Não há outras integrações externas neste repositório.

## 11. Restrições e premissas

- O backend não está neste repositório e deve estar operacional em `http://localhost:8000/api` para o painel funcionar (não há dados mockados).
- A autenticação depende de cookie de sessão; `withCredentials: true` em todas as chamadas.
- Itens do menu **Catálogo/Produtos** e **Configurações** existem apenas na navegação — as rotas ainda não foram implementadas (premissa: serão entregues em iterações futuras).
- A página "Home" (`/`) está no menu, mas **não há rota/componente** que a renderize; navegar para `/` cai no wildcard `**` → `/error/404` (a confirmar — pode ser comportamento indesejado ou rota a criar). Inclusive após o login, que navega para `/`.
- `UserService.search` não está implementado (lança erro); por isso não há lookup de usuário.

## 12. Critérios de aceite (gerais)

- Usuário sem sessão é direcionado ao login; usuário autenticado permanece logado ao recarregar.
- Usuário sem permissão não vê o item no menu e, se acessar a URL diretamente, vê a página 403.
- Listagens suportam filtro, ordenação, paginação e (quando o recurso permite) exportação Excel/CSV.
- Submissão de formulário inválido no cliente não chega à API; erros de validação da API são exibidos campo a campo.
- Código deve passar em `npm run lint` e `npm test` (detalhes no DoD do spec.md).

---

Histórico de revisões: documento gerado a partir do estado atual do código (fonte da verdade). Diferenças entre esta documentação e a implementação devem ser reportadas e corrigidas aqui.