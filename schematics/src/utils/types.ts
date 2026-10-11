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
  | 'datetime';

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
  /** Formato do formulário. */
  'form-type'?: FormType;
  /** Gera as opções de exportação na listagem. */
  'with-export'?: boolean;
  /** Não adiciona a entrada no menu. */
  'skip-menu'?: boolean;
  /** Não gera/registra o arquivo de rotas. */
  'skip-routes'?: boolean;
  /** Não gera o componente de lookup. */
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
  skipMenu: boolean;
  skipRoutes: boolean;
  skipLookup: boolean;
  skipTests: boolean;
  force: boolean;
  dryRun: boolean;
  /** Raiz do código-fonte lida do `angular.json` (ex.: `src`). */
  sourceRoot: string;
  /** Número de segmentos do módulo (ex.: `third-party` → 1). */
  moduleSegments: number;
  /** Caminho destino base (ex.: `src/app/features/third-party/partner-types`). */
  featureDir: string;
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
  colsLines: string;
  filterLines: string;
  formTypeLines: string;
  formGroupLines: string;
  formFieldBlocks: string;
  formSkeletonBlocks: string;
  formFormsImport: string;
  formPrimeImports: string;
  formImportModules: string;
  listExportImports: string;
  listExportMenuBlock: string;
  listFacadeConfig: string;
}
