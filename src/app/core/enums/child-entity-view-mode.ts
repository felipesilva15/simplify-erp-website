/**
 * Modos de visualização de uma lista de itens filhos (1:N) dentro de um
 * formulário pai.
 *
 * - `InlineTable`: edição por célula, na própria linha da tabela. Indicado
 *   para entidades com poucos campos e validações simples.
 * - `ReadonlyTableModal`: tabela somente leitura com colunas resumidas; a
 *   edição ocorre em modal, com um componente de formulário próprio da
 *   entidade. Indicado para entidades complexas, com muitos campos ou
 *   validações elaboradas.
 */
export enum ChildEntityViewMode {
    InlineTable = 'inline-table',
    ReadonlyTableModal = 'readonly-table-modal',
}
