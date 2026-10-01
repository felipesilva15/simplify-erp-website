import { LookupItem } from '../models/lookup-item';

/**
 * Utilitários de payload compartilhados entre `CrudFormFacade` e
 * `ChildEntityListFacade`, para que ambos convertam `LookupItem` do formulário
 * na representação enviada à API de forma idêntica.
 */

export function isLookupItem(value: unknown): boolean {
    return (
        typeof value === 'object' &&
        value !== null &&
        'key' in value &&
        'label' in value &&
        'meta' in value
    );
}

/**
 * Converte recursivamente `LookupItem` no payload: campo único vira `key` e
 * arrays de lookups viram o `meta` de cada item.
 */
export function unwrapLookups(payload: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(payload).map(([key, value]) => {
            if (isLookupItem(value)) {
                return [key, (value as LookupItem).key ?? null];
            }

            if (Array.isArray(value) && value.every(isLookupItem)) {
                return [key, value.map((item: LookupItem) => item.meta ?? null)];
            }

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                return [key, unwrapLookups(value as Record<string, unknown>)];
            }

            return [key, value];
        })
    );
}

/**
 * Serializa um valor para o payload da API: `Date` vira ISO, `LookupItem` vira
 * `key` e a conversão é recursiva — inclusive dentro de arrays, caso que
 * `unwrapLookups` não cobre (usado por listas de itens filhos).
 */
export function serializeValue(
    value: unknown,
    formatDate: (date: Date) => string
): unknown {
    if (value instanceof Date) {
        return formatDate(value);
    }

    if (isLookupItem(value)) {
        return (value as LookupItem).key ?? null;
    }

    if (Array.isArray(value)) {
        if (value.every(isLookupItem)) {
            return value.map((item: LookupItem) => item.meta ?? null);
        }

        return value.map(item => serializeValue(item, formatDate));
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
                key,
                serializeValue(entry, formatDate),
            ])
        );
    }

    return value;
}
