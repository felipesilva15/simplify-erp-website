export type FormType = 'dialog' | 'page';

export type FieldType =
  | 'string'
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'integer'
  | 'decimal'
  | 'currency'
  | 'percent'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'enum';

/** Uma opção de enum (`VALOR` no domínio + rótulo pt-BR). */
export interface EnumValue {
  /** Nome do membro da enum em PascalCase (ex.: `Product`). */
  name: string;
  /** Valor persistido (ex.: `PRODUCT`). */
  value: string;
  /** Rótulo pt-BR (ex.: `Produtos`). */
  label: string;
}

/** Opções comuns aceitas por todos os schematics. */
export interface BaseSchema {
  /** Módulo/feature de destino, em kebab-case (ex.: `third-party`). */
  module: string;
  /** Nome do recurso no singular, em kebab-case (ex.: `partner-type`). */
  name: string;
  /** Definição de campos: `nome:string,ativo:boolean,valor:number`. */
  fields?: string;
  /** Forma plural do recurso (kebab-case). Sobrescreve a pluralização automática. */
  plural?: string;
  /** Rótulo singular em pt-BR (ex.: `Tipo de parceiro`). */
  label?: string;
  /** Rótulo plural em pt-BR (ex.: `Tipos de parceiro`). */
  'label-plural'?: string;
  /** Rótulo do grupo de menu do módulo (ex.: `Terceiro`). */
  'module-label'?: string;
  /** Ícone PrimeIcons do item de menu (ex.: `pi pi-star`). */
  'menu-icon'?: string;
  /** Chave de permissão base (ex.: `partnerTypes`). Sobrescreve a derivação automática. */
  'permission-key'?: string;
  /** Texto do placeholder de busca da listagem. */
  placeholder?: string;
  /** Texto do placeholder do componente de lookup (padrão: o mesmo da listagem). */
  'lookup-placeholder'?: string;
  /** Trata campos terminados em `_id` como lookups automaticamente (padrão: `true`). */
  'detect-lookups'?: boolean;
  /** Formato do formulário. */
  'form-type'?: FormType;
  /** Gera as opções de exportação na listagem e no service. */
  'with-export'?: boolean;
  /** Implementa `LogableService` (método `activityLogs`) no service. */
  'with-log'?: boolean;
  /** Não adiciona a entrada no menu. */
  'skip-menu'?: boolean;
  /** Não gera/registra o arquivo de rotas. */
  'skip-routes'?: boolean;
  /** Não gera o componente de lookup (e o service não implementa `LookupService`). */
  'skip-lookup'?: boolean;
  /** Não gera arquivos `*.spec.ts`. */
  'skip-tests'?: boolean;
  /** Sobrescreve arquivos existentes. */
  force?: boolean;
  /** Executa sem escrever no disco. */
  'dry-run'?: boolean;
}

export interface FieldDefinition {
  /** Nome do campo exatamente como informado (ex.: `ibge_code`). */
  name: string;
  type: FieldType;
  /** Rótulo humano do campo (ex.: `Código IBGE`). */
  label: string;
  optional: boolean;
  /** Para `type=lookup`: recurso referenciado no singular, em kebab-case (ex.: `state`). */
  reference?: string;
  /** Para `type=lookup`: módulo do recurso referenciado (kebab-case; padrão: o módulo atual). */
  referenceModule?: string;
  /** `true` quando o tipo `lookup` foi inferido pelo sufixo `_id`. */
  inferredLookup?: boolean;
  /** Para `type=enum`: nome da classe gerada (ex.: `ProductApplicability`). */
  enumClass?: string;
  /** Para `type=enum`: nome do arquivo gerado, sem extensão (ex.: `product-applicability`). */
  enumFile?: string;
  /** Para `type=enum`: valores da enumeração. */
  enumValues?: EnumValue[];
}

export interface NormalizedOptions {
  /** Módulo em kebab-case; pode conter `/` para módulos aninhados. */
  module: string;
  /** Recurso no plural, em kebab-case; define pasta, rota e menu. */
  resource: string;
  /** Recurso no singular, em kebab-case; define classe, model e nomes de arquivo. */
  singular: string;
  className: string;
  serviceClass: string;
  listClass: string;
  formClass: string;
  lookupClass: string;
  routesConst: string;
  moduleRoutesConst: string;
  moduleLabel: string;
  label: string;
  labelPlural: string;
  menuIcon: string;
  permission: string;
  formType: FormType;
  fields: FieldDefinition[];
  withExport: boolean;
  withLog: boolean;
  skipMenu: boolean;
  skipRoutes: boolean;
  skipLookup: boolean;
  skipTests: boolean;
  detectLookups: boolean;
  /** Placeholder de busca informado em `--placeholder` (vazio = derivado dos campos). */
  placeholder: string;
  /** Placeholder do lookup informado em `--lookup-placeholder` (vazio = o da listagem). */
  lookupPlaceholder: string;
  force: boolean;
  dryRun: boolean;
  /** Raiz do código-fonte lida do `angular.json` (ex.: `src`). */
  sourceRoot: string;
  /** Número de segmentos do módulo (ex.: `third-party` → 1). */
  moduleSegments: number;
  /** Caminho destino base (ex.: `src/app/features/third-party/partner-types`). */
  featureDir: string;
}

/** Opções normalizadas do schematic `module` (apenas cria a pasta/rotas do módulo). */
export interface NormalizedModuleOptions {
  /** Módulo em kebab-case; pode conter `/` para módulos aninhados. */
  module: string;
  /** Caminho da pasta do módulo (ex.: `src/app/features/catalog`). */
  moduleDir: string;
  /** Caminho do arquivo de rotas do módulo (ex.: `.../catalog.routes.ts`). */
  routesPath: string;
  moduleRoutesConst: string;
  moduleLabel: string;
  menuIcon: string;
  skipMenu: boolean;
  skipRoutes: boolean;
  force: boolean;
  sourceRoot: string;
  moduleSegments: number;
}

/** Contexto mínimo para resolver referências de lookup em listagem/formulário. */
export interface LookupRenderContext {
  module: string;
  singular: string;
  /** Prefixo `../` (com 4 níveis além dos segmentos do módulo) até `src/app/`. */
  toAppDeep: string;
  /** `false` quando `--skip-lookup`: campos `_id` caem para `number`. */
  lookupsEnabled: boolean;
}

/** Contexto entregue aos templates `.template`. */
export interface TemplateContext extends NormalizedOptions {
  /** `name` usado nos nomes de arquivo (`__name@dasherize__`). */
  name: string;
  dasherize: (value: string) => string;
  /** Prefixo `../` para arquivos em `models/` e `services/`. */
  toApp: string;
  /**
   * Prefixo `../` com um nível a mais que `toApp`. Usado em `pages/*`,
   * `components/*` e no import de `environments` do service.
   */
  toAppDeep: string;
  /** Prefixo `../` para o arquivo `<recurso>.routes.ts`. */
  toAppRoutes: string;
  listSelector: string;
  formSelector: string;
  lookupSelector: string;
  listTitle: string;
  lookupPlaceholder: string;
  searchPlaceholder: string;
  listRouterOutlet: string;
  permViewAny: string;
  permView: string;
  permCreate: string;
  permEdit: string;
  permUpdate: string;
  permDelete: string;
  modelFields: string;
  modelImports: string;
  colsLines: string;
  filterLines: string;
  listImports: string;
  formTypeLines: string;
  formGroupLines: string;
  formFieldBlocks: string;
  formSkeletonBlocks: string;
  formFormsImport: string;
  formPrimeImports: string;
  formImportModules: string;
  formExtraImports: string;
  formEnumProperties: string;
  serviceImports: string;
  serviceImplements: string;
  serviceMethods: string;
  listExportImports: string;
  listExportMenuBlock: string;
  listFacadeConfig: string;
}
