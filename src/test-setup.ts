/**
 * Polyfills globais do ambiente de testes (jsdom).
 *
 * O `pFrozenColumn` do PrimeNG, usado na tabela resumida dos itens filhos,
 * instancia um `ResizeObserver` para recalcular a posição sticky da coluna
 * congelada — e o jsdom não expõe esse tipo nativamente. O mock registra as
 * chamadas sem fazer nada, já que a posição real não é verificada nos testes.
 */
class ResizeObserverMock {
    observe(): void {
        void 0;
    }
    unobserve(): void {
        void 0;
    }
    disconnect(): void {
        void 0;
    }
}

if (!('ResizeObserver' in globalThis)) {
    globalThis.ResizeObserver = ResizeObserverMock;
}