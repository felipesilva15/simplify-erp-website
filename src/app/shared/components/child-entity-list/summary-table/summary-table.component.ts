import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SummaryTableView } from '../../../../core/contracts/summary-table-view';
import { ChildFieldDefinition } from '../../../../core/models/child-field-definition';
import { BreakpointService } from '../../../../core/services/breakpoint.service';
import { CellValueFormatterService } from '../../../services/cell-value-formatter.service';

/**
 * View do modo `readonly-table-modal`: tabela somente leitura com as colunas
 * resumidas do item e o número da ordem (configurável). As ações de cada item
 * ficam congeladas à direita da tabela (PrimeNG `pFrozenColumn`), de modo que
 * permanecem visíveis mesmo com scroll horizontal:
 * - **visualizar** (olho): sempre disponível, abre o modal em modo somente
 *   leitura — inclusive quando o formulário pai está desabilitado;
 * - **editar** (lápis): desabilitado quando a lista está desabilitada;
 * - **remover** (lixeira): desabilitado quando a lista está desabilitada.
 *
 * Não há menu de contexto: as ações são expostas diretamente na linha (ou no
 * card, no mobile).
 *
 * A responsividade é uma troca de template dentro deste mesmo componente —
 * tabela acima do breakpoint, layout empilhado (pares label/valor) abaixo —
 * mantendo idênticas a edição, a visualização, as ações e a exibição de erros.
 */
@Component({
    selector: 'app-summary-table',
    imports: [TableModule, ButtonModule, TagModule, TooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block' },
    templateUrl: './summary-table.component.html',
})
export class SummaryTableComponent<T = unknown> {
    private formatter: CellValueFormatterService = inject(CellValueFormatterService);
    private breakpoint: BreakpointService = inject(BreakpointService);

    view = input.required<SummaryTableView<T>>();

    /** Abre o editor do item na posição informada. */
    openEditor = output<number>();

    /** Abre o item em modo somente leitura (visualização). */
    viewItem = output<number>();

    /** Solicita a remoção do item na posição informada. */
    itemRemoved = output<number>();

    isMobile = this.breakpoint.isMobile;

    get columnCount(): number {
        const extraColumns = (this.showOrder() ? 1 : 0) + 1;

        return this.view().columns().length + extraColumns;
    }

    showOrder(): boolean {
        return this.view().showOrder();
    }

    /** Número da ordem do item (1-based), usado na coluna de ordem e nos cards. */
    orderNumber(index: number): number {
        return index + 1;
    }

    formatValue(item: T, column: ChildFieldDefinition): string {
        return this.formatter.format(item, column);
    }

    errorTooltip(index: number): string {
        const { fields, messages } = this.view().rowErrors(index);

        return [...messages, ...Object.values(fields).flat()].join(' ');
    }
}
