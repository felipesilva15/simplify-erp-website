import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    Signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SummaryTableView } from '../../../core/contracts/summary-table-view';
import { ChildEntityViewMode } from '../../../core/enums/child-entity-view-mode';
import { ChildEntityListConfig } from '../../../core/models/child-entity-list-config';
import { ChildFieldDefinition } from '../../../core/models/child-field-definition';
import { ChildEntityListFacade } from '../../facades/child-entity-list.facade';
import { SummaryTableComponent } from './summary-table/summary-table.component';

/**
 * Orquestrador de uma lista de itens filhos (1:N) dentro de um formulário pai.
 *
 * Responsabilidades:
 * - expor o cabeçalho da seção (título + ação de inclusão, no mesmo padrão do
 *   cabeçalho da listagem principal);
 * - escolher a view conforme `config.viewMode`;
 * - fazer a ponte com o formulário pai via `ControlValueAccessor`, de modo que
 *   `formControlName` cuide da carga, do payload e do estado de alteração.
 *
 * Ele não sabe renderizar campos: apenas conhece o facade (estado) e a view
 * de apresentação. Toda a lógica de estado, diffing e erro de validação está no
 * `ChildEntityListFacade`.
 */
@Component({
    selector: 'app-child-entity-list',
    imports: [
        SummaryTableComponent,
        ButtonModule,
        MessageModule,
    ],
providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: ChildEntityListComponent,
        multi: true,
      },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './child-entity-list.component.html',
    styleUrl: './child-entity-list.component.scss',
})
export class ChildEntityListComponent<T = unknown> implements ControlValueAccessor {
private changeHandler: (value: unknown[]) => void = () => {};
  private touchHandler: () => void = () => {};

  facade: ChildEntityListFacade<T> = inject<ChildEntityListFacade<T>>(ChildEntityListFacade);

    /** Modos de visualização suportados, expostos para o `@switch` do template. */
    readonly ChildEntityViewMode = ChildEntityViewMode;

    /**
     * Configuração da lista. Deve ser a mesma instância entregue ao provider do
     * `ChildEntityListFacade`, para que o modo de visualização e o schema de
     * campos venham sempre da mesma fonte.
     */
    config = input.required<ChildEntityListConfig<T>>();

    viewMode: Signal<ChildEntityViewMode> = computed(() => this.config().viewMode);

    columns: Signal<ChildFieldDefinition[]> = computed(() => this.config().columns);

    /** Superfície de leitura entregue à view do modo tabela resumida. */
    summaryView: Signal<SummaryTableView<T>> = computed<SummaryTableView<T>>(() => ({
        items: this.facade.items,
        columns: this.columns,
        disabled: this.facade.disabled,
        emptyMessage: this.facade.emptyMessage,
        rowErrors: (index: number) => this.facade.rowErrors(index),
        itemErrorCount: (index: number) => this.facade.itemErrorCount(index),
    }));

    constructor() {
        this.facade.registerOnChange((value: unknown[]) => this.changeHandler(value));
    }

    // ---- ControlValueAccessor ------------------------------------------------------

    writeValue(value: unknown): void {
        this.facade.writeValue(value);
    }

    registerOnChange(fn: (value: unknown[]) => void): void {
        this.changeHandler = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.touchHandler = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.facade.setDisabledState(isDisabled);
    }

    // ---- Intenções -----------------------------------------------------------------

    onAdd(): void {
        this.touchHandler();
        this.facade.add();
    }

    onOpenEditor(index: number): void {
        this.touchHandler();
        this.facade.edit(index);
    }

    onRemoveItem(index: number): void {
        this.touchHandler();
        void this.facade.remove(index);
    }
}
