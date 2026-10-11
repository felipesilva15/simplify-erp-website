# Schematics — Simplify ERP

Coleção de [Angular Schematics](https://angular.dev/tools/cli/schematics) para gerar
CRUDs completos no projeto `simplify-erp-website` seguindo exatamente os padrões de
código existentes (model, service, listagem, formulário, rotas, menu, lookup e
exportação).

O schematic principal, `crud`, compõe os schematics parciais. Cada etapa também pode
ser executada isoladamente para complementar um recurso já existente.

---

## 1. Pré-requisitos

- Node.js e as dependências do projeto raiz já instaladas (`npm install`).
- Compilar a coleção antes de usá-la (o CLI aponta para `schematics/dist`):

```bash
npm --prefix schematics run build
```

> O `dist/` é ignorado no Git. Sempre rode o build após alterar os schematics.

---

## 2. Como executar

O CLI do Angular aceita o caminho da coleção:

```bash
npx ng generate ./schematics/collection.json:crud --module=<modulo> --name=<recurso>
```

Exemplo (módulo `third-party`, recurso `partner-type`):

```bash
npx ng generate ./schematics/collection.json:crud \
  --module=third-party \
  --name=partner-type \
  --fields="name:string:Nome,document:string:Documento,active:boolean:Ativo" \
  --label="Tipo de parceiro" \
  --label-plural="Tipos de parceiro" \
  --module-label="Terceiro" \
  --menu-icon="pi pi-tag"
```

Use `--dry-run` para pré-visualizar as alterações sem gravar nada.

Para uma coleção publicada/instalada em `node_modules`, o comando seria
`ng generate @simplify-erp/schematics:crud ...`. Neste repositório a coleção é
privada e não publicada, então use o caminho acima.

---

## 3. Schematics disponíveis

| Schematic | Descrição |
| --- | --- |
| `crud` | Gera o CRUD completo (model + service + lookup + listagem + formulário + rotas + menu e, opcionalmente, exportação). |
| `model` | Gera apenas `models/<recurso>.ts`. |
| `service` | Gera apenas `services/<recurso>-service.ts` (+ spec). |
| `list` | Gera apenas a página de listagem. |
| `form` | Gera apenas o formulário (`dialog` ou `page`). |
| `routes` | Gera `<recurso>s.routes.ts` e registra o recurso no arquivo de rotas do módulo. |
| `menu` | Adiciona a entrada do recurso no menu (`src/app/core/config/menu.ts`). |
| `lookup` | Gera apenas o componente de lookup. |
| `export` | Adiciona as opções de exportação a uma listagem **já existente**. |

Todos aceitam `--module`, `--name` e as opções comuns abaixo.

---

## 4. Opções

### Comuns a todos

| Opção | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `--module` | string | — | **Obrigatório.** Módulo/feature de destino em kebab-case (ex.: `third-party`). Deve existir em `src/app/features/<module>`. |
| `--name` | string | — | **Obrigatório.** Recurso no **singular** em kebab-case (ex.: `partner-type`). |
| `--fields` | string | `name:string` | Campos no formato `nome:tipo[:Rótulo]`, separados por vírgula. |
| `--plural` | string | derivado | Plural do recurso. Sobrescreve a pluralização automática. |
| `--label` | string | derivado | Rótulo singular em pt-BR (ex.: `Tipo de parceiro`). |
| `--label-plural` | string | derivado | Rótulo plural em pt-BR (ex.: `Tipos de parceiro`). |
| `--module-label` | string | mapa/derivado | Rótulo do grupo no menu e breadcrumb (ex.: `Terceiro`). |
| `--menu-icon` | string | `pi pi-star` | Ícone PrimeIcons do item de menu. |
| `--permission-key` | string | derivado | Chave base de permissão (ex.: `partnerTypes`). |
| `--force` | boolean | `false` | Sobrescreve arquivos existentes. |
| `--dry-run` | boolean | `false` | Executa sem gravar (nativo do CLI). |

### Exclusivas do `crud`

| Opção | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `--form-type` | `dialog` \| `page` | `dialog` | Formato do formulário. |
| `--with-export` | boolean | `false` | Inclui as opções de exportação na listagem. |
| `--skip-menu` | boolean | `false` | Não adiciona a entrada no menu. |
| `--skip-routes` | boolean | `false` | Não gera nem registra o arquivo de rotas. |
| `--skip-lookup` | boolean | `false` | Não gera o componente de lookup. |
| `--skip-tests` | boolean | `false` | Não gera arquivos `*.spec.ts`. |

`--form-type` e `--module`/`--name` possuem `x-prompt`: se omitidos, o CLI pergunta
interativamente.

---

## 5. A opção `--fields`

Gramática:

```
campo:tipo[:Rótulo]   (campos separados por vírgula)
```

- `?` ao final do nome marca o campo como **opcional** (ex.: `email?:string`).
- Tipos aceitos:

| Tipo | Model | Controle do formulário |
| --- | --- | --- |
| `string`, `text`, `email` | `string` | `<input pInputText>` (`email` valida formato/max 255) |
| `textarea` | `string` | `<textarea pTextarea>` (max 512) |
| `number`, `integer`, `decimal`, `currency`, `percent` | `number` | `<p-inputnumber>` |
| `boolean` | `boolean` | `<p-toggleswitch>` |
| `date`, `datetime` | `Date` | `<p-datepicker>` |

Exemplo:

```bash
--fields="name:string:Nome,email:email,age:integer:Idade,active:boolean:Ativo,joined_at:date"
```

> **Limitação:** `--fields` só cobre tipos primitivos. Campos relacionais (lookups)
> devem ser adicionados manualmente após a geração.

Sem `--fields`, é gerado o esqueleto mínimo com um único campo `name:string`
("Nome") — isso evita uma interface `FormType` vazia.

---

## 6. Convenção de nomes

O projeto usa **pasta/rota/menu no plural** e **classe/model no singular**.

Dado `--name=partner-type`:

| Elemento | Valor |
| --- | --- |
| Pasta / rota / menu | `partner-types` |
| Classe / model | `PartnerType` |
| Service | `PartnerTypeService` |
| Constante de rotas | `PARTNER_TYPES_ROUTES` |
| Permissões | `partnerTypes.viewAny`, `.view`, `.create`, `.edit`, `.update`, `.delete` |

A pluralização é conservadora e pode ser sobrescrita com `--plural`. A chave de
permissão é derivada em camelCase do plural e pode ser sobrescrita com
`--permission-key`.

### Rótulos

Os rótulos pt-BR são opcionais e possuem fallback:

- `--label` / `--label-plural` → `humanize(<singular|plural>)` (ex.: `Partner type`).
- `--module-label` → mapa interno (`geography` → `Geografia`, `third-party` →
  `Terceiro`, `security` → `Segurança`, `hr` → `RH`, `catalog` → `Catálogo`,
  `configuration`/`configurations` → `Configurações`) ou `humanize(module)`.

Para um resultado em português idiomático, informe os rótulos explicitamente (a
derivação automática não sabe traduzir, ex.: `partner-type` → `Tipo de parceiro`).

Para adicionar um novo módulo ao mapa, edite
`schematics/src/utils/module-labels.ts`.

---

## 7. Arquivos gerados

Para `--module=third-party --name=partner-type`:

```
src/app/features/third-party/partner-types/
├── models/partner-type.ts
├── services/partner-type-service.ts
├── services/partner-type-service.spec.ts
├── components/partner-type-lookup/
│   ├── partner-type-lookup.component.ts
│   ├── partner-type-lookup.component.html
│   ├── partner-type-lookup.component.scss
│   └── partner-type-lookup.component.spec.ts
├── pages/partner-type-list/
│   ├── partner-type-list.page.ts
│   ├── partner-type-list.page.html
│   ├── partner-type-list.page.scss
│   └── partner-type-list.page.spec.ts
├── pages/partner-type-form/
│   ├── partner-type-form.dialog.ts      (ou .page.ts)
│   ├── partner-type-form.dialog.html
│   ├── partner-type-form.dialog.scss
│   └── partner-type-form.dialog.spec.ts
└── partner-types.routes.ts
```

Além disso, são atualizados:

- `src/app/features/<module>/<module>.routes.ts` — registro da rota lazy.
- `src/app/core/config/menu.ts` — item de menu no grupo do módulo.

### `dialog` vs `page`

- **`dialog` (padrão):** o formulário abre em modal (`DynamicDialogHostComponent`).
  A rota de listagem declara um filho vazio que hospeda o dialog e a página de
  listagem inclui `<router-outlet />`.
- **`page`:** o formulário é uma rota irmã. Não há `<router-outlet />` na listagem.

---

## 8. Idempotência e `--force`

- As edições em rotas e menu são **cirúrgicas e idempotentes**: rodar o mesmo
  schematic duas vezes não duplica entradas. Elas só tocam o ponto de inserção,
  preservando a formatação existente.
- Arquivos gerados que **já existem** são preservados (com aviso) por padrão. Use
  `--force` para sobrescrevê-los.
- O schematic `export` detecta se a exportação já foi adicionada e não duplica.

---

## 9. Testes

```bash
npm --prefix schematics test
```

Os testes usam `SchematicTestRunner` sobre um workspace virtual e cobrem:
geração completa, cada schematic parcial, idempotência, variantes `dialog`/`page`,
`--with-export`, opções de fallback e mensagens de erro.

---

## 10. Arquitetura

```
schematics/
├── collection.json          # registro dos schematics (aponta para dist/)
├── package.json             # scripts de build/test
├── tsconfig*.json
├── vitest.config.ts
├── scripts/copy-assets.mjs  # copia templates/schemas para dist/
└── src/
    ├── <schematic>/         # index.ts + schema.{json,d.ts} + files/ + files-test/
    ├── utils/
    │   ├── options.ts       # validação e derivação de nomes
    │   ├── names.ts         # pluralize/singularize/humanize/constantCase
    │   ├── fields.ts        # parse de --fields + codegen de model/list
    │   ├── form-codegen.ts  # codegen do formulário (dialog/page)
    │   ├── context.ts       # contexto entregue aos templates
    │   ├── generate.ts      # applyTemplateSource + preservação de arquivos
    │   ├── menu.ts          # patch idempotente do menu
    │   ├── module-routes.ts # patch idempotente das rotas do módulo
    │   ├── export-menu.ts   # blocos de exportação
    │   ├── text.ts          # helpers de parsing/inserção de texto
    │   └── ...
    └── testing/helpers.ts   # runner + árvore virtual
```

- Os templates ficam em pastas `files/` (código) e `files-test/` (specs),
  separados da lógica, e são aplicados via `apply(url(...), [applyTemplates, move])`.
- O `crud` executa cada etapa como **sub-schematic** (`schematic('model', ...)`,
  `schematic('service', ...)`, ...) para que os caminhos relativos dos templates
  sejam resolvidos no diretório correto de cada schematic.

---

## 11. Pontos de atenção

- **Módulo precisa existir** em `src/app/features/<module>`; caso contrário o
  schematic falha listando os módulos disponíveis.
- **`--fields` é sequencial e sem validação de domínio:** ajuste labels, validadores
  e máscaras manualmente quando necessário.
- **Permissões:** mantenha o padrão do projeto. O menu e as rotas usam `.edit`; as
  facades (lista e formulário) usam `.update`. Isso é intencional e reflete o código
  atual.
- **Pluralização irregular de permissões:** o projeto real tem casos como
  `partnerTypes` (correto) e `productsCategories`/`productsBrands`. O schematic
  gera a forma correta (`<plural>camelizado`); se o backend usar outro padrão,
  sobrescreva com `--permission-key`.
- **Serviços de CRUDs recentes** no app podem estar incompletos
  (`Method not implemented`); a geração segue o padrão completo do
  `state-service`.
- O `npm run lint` e o `ng build` do projeto **já falham no baseline** por motivos
  alheios à coleção (lint de arquivos legados e budget do bundle inicial). Os
  arquivos gerados passam no lint e compilam sem erros de TypeScript.
