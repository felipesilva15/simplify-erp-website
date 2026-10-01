import { DestroyRef, inject, Injectable, signal, Signal } from '@angular/core';

/**
 * Critério único de mobile do projeto (ver `docs/spec.md` §12). Compartilhado
 * pelas listagens e pelas listas de itens filhos, para que a troca de template
 * ocorra sempre no mesmo ponto.
 */
export const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

/**
 * Observa o breakpoint de mobile uma única vez para toda a aplicação.
 *
 * Usado por views que precisam trocar o template de renderização da linha
 * (tabela ⇄ layout empilhado) sem duplicar a mesma lógica e listener.
 */
@Injectable({ providedIn: 'root' })
export class BreakpointService {
    private readonly _isMobile = signal<boolean>(false);
    private mediaQuery?: MediaQueryList;

    isMobile: Signal<boolean> = this._isMobile.asReadonly();

    constructor() {
        this.setup();

        inject(DestroyRef).onDestroy(() => {
            this.mediaQuery?.removeEventListener('change', this.onMediaChange);
        });
    }

    private onMediaChange = (event: MediaQueryListEvent): void => {
        this._isMobile.set(event.matches);
    };

    private setup(): void {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        this.mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
        this._isMobile.set(this.mediaQuery.matches);
        this.mediaQuery.addEventListener('change', this.onMediaChange);
    }
}
