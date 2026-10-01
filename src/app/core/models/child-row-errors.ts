/**
 * Erros de validação de um item filho, normalizados a partir do mapa de erros
 * da API (`{ "contacts.2.name": ["mensagem"] }`).
 *
 * A estrutura é indexada por chave de linha (estável) e, dentro dela, por
 * campo — desacoplada do modo de visualização, que apenas decide *como*
 * exibi-la.
 */
export interface ChildRowErrors {
    /** Mensagens por campo do item. A chave é o nome do campo (`name`, `address.street`, ...). */
    fields: Record<string, string[]>;

    /** Mensagens sem campo associado (ex.: `{ "contacts.2": ["..."] }`). */
    messages: string[];
}
