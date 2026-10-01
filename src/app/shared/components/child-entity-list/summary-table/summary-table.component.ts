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
 * resumidas do item. A edição ocorre no modal, aberto pelo clique na linha ou
 * pelo ícone de edição; a remoção é direta, pelo ícone da lixeira.
 *
 * Não há menu de contexto: existem apenas duas ações por item.
 *
 * A responsividade é uma troca de template dentro deste mesmo componente —
 * tabela acima do breakpoint, layout empilhado (pares label/valor) abaixo —
 * mantendo idênticas a edição, as ações e a exibição de erros.
 */
@Component({
    selector: 'app-summary-table',
    imports: [TableModule, ButtonModule, TagModule, TooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './summary-table.component.html',
    styleUrl: './summary-table.component.scss',
})
export class SummaryTableComponent<T = unknown> {
    private formatter: CellValueFormatterService = inject(CellValueFormatterService);
    private breakpoint: BreakpointService = inject(BreakpointService);

    view = input.required<SummaryTableView<T>>();

    /** Abre o editor do item na posição informada. */
    openEditor = output<number>();

    /** Solicita a remoção do item na posição informada. */
    itemRemoved = output<number>();

    isMobile = this.breakpoint.isMobile;

    get columnCount(): number {
        return this.view().columns().length + 1;
    }

    formatValue(item: T, column: ChildFieldDefinition): string {
        return this.formatter.format(item, column);
    }

    errorTooltip(index: number): string {
        const { fields, messages } = this.view().rowErrors(index);

        return [...messages, ...Object.values(fields).flat()].join(' ');
    }
}
