import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideNgxMask } from 'ngx-mask';
import { beforeEach, vi } from 'vitest';
import { PermissionService } from './app/core/auth/services/permission-service';

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

/**
 * O `ToastService` é resolvido em root e depende do `MessageService` do
 * PrimeNG. Fornecemos um mock padrão para que os testes que não verificam
 * notificações não precisem repetir essa configuração.
 */
beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            provideHttpClient(),
            provideHttpClientTesting(),
            provideNgxMask(),
            { provide: PermissionService, useValue: { has: () => true, hasAny: () => true } },
            { provide: MessageService, useValue: { add: vi.fn(), clear: vi.fn() } },
            { provide: ConfirmationService, useValue: { confirm: vi.fn(), close: vi.fn() } }
        ]
    });
});