import { Type } from '@angular/core';
import { ChildEntityForm } from '../contracts/child-entity-form';
import { DialogSize } from '../enums/dialog-size';
import { ChildEntityViewMode } from '../enums/child-entity-view-mode';
import { ChildFieldDefinition } from './child-field-definition';

/**
 * Configuração de uma lista de itens filhos (1:N) exibida dentro de um
 * formulário pai. Adicionar uma nova entidade filha deve exigir apenas esta
 * configuração, sem duplicar lógica de estado.
 *
 * As validações do item **não** ficam aqui: no modo
 * `ReadonlyTableModal` cada entidade tem seu próprio componente de formulário
 * (injetado dinamicamente no shell), que é quem define layout, campos
 * condicionais, validação cruzada e abas. Esquemas de campo genéricos não
 * escalam para esses casos.
 *
 * @example
 * ```ts
 * export const CONTACTS_LIST_CONFIG: ChildEntityListConfig<Contact> = {
 *     arrayKey: 'contacts',
 *     viewMode: ChildEntityViewMode.ReadonlyTableModal,
 *     itemLabel: 'Contato',
 *     itemsLabel: 'Contatos',
 *     columns: [
 *         { field: 'name', header: 'Nome' },
 *         { field: 'email', header: 'E-mail' },
 *     ],
 *     createItem: () => ({ id: 0, name: '', email: '', phone: '' }),
 *     formComponent: ContactFormComponent,
 * };
 * ```
 */
export interface ChildEntityListConfig<T> {
    /**
     * Nome do array no payload do pai. Também é o prefixo das chaves de erro
     * da API (`{ "contacts.2.name": ["..."] }`).
     */
    arrayKey: string;

    /** Modo de visualização da lista. */
    viewMode: ChildEntityViewMode;

    /**
     * Colunas exibidas na tabela resumida
     * (`ReadonlyTableModal`). Ignorado em `InlineTable`, cujo schema de campos
     * é propriedade do componente de tabela.
     */
    columns: ChildFieldDefinition[];

    /** Cria um item em branco. Usado ao abrir o modal em modo criação. */
    createItem: () => T;

    /**
     * Componente de formulário da entidade, instanciado dinamicamente dentro
     * do shell do modal. Obrigatório em `ReadonlyTableModal`.
     */
    formComponent?: Type<ChildEntityForm<T>>;

    /** Rótulo singular do item. Default: `'Item'`. */
    itemLabel?: string;

    /** Rótulo plural, usado no cabeçalho da seção. Default: `'Itens'`. */
    itemsLabel?: string;

    /** Rótulo da ação de inclusão. Default: `'Incluir'`. */
    addLabel?: string;

    /** Rótulo da ação de confirmação no modal. Default: `'Salvar'`. */
    submitLabel?: string;

    /** Rótulo do cancelamento. Default: `'Voltar'`. */
    cancelLabel?: string;

    /** Mensagem exibida quando não há itens. Default: `'Nenhum registro encontrado.'`. */
    emptyMessage?: string;

    /** Tamanho do modal. Default: `DialogSize.Medium`. */
    dialogSize?: DialogSize;

    /** Confirmação antes de remover um item. Sem o hook, a remoção é direta. */
    removeConfirmMessage?: (item: T) => string;

    /**
     * Hidrata um item recém-carregado da API (datas ISO, lookups, ...).
     * Default: identidade.
     */
    hydrateItem?: (item: T) => T;

    /**
     * Serializa um item para o payload do pai (desempacota lookups, converte
     * datas, ...). Default: desempacota lookups e converte `Date` em ISO.
     */
    serializeItem?: (item: T) => unknown;
}
