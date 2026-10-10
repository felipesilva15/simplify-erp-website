import { KeyValue } from '@angular/common';
import { computed, inject, signal, Signal, Type, WritableSignal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { take } from 'rxjs';
import { ChildEntityForm } from '../../core/contracts/child-entity-form';
import { ChildItemEditor } from '../../core/contracts/child-item-editor';
import { DialogSize } from '../../core/enums/dialog-size';
import { ChildEntityViewMode } from '../../core/enums/child-entity-view-mode';
import { serializeValue } from '../../core/lib/lookup-payload';
import { ChildEntityListConfig } from '../../core/models/child-entity-list-config';
import { ChildErrorsIndex } from '../../core/models/child-errors-index';
import { ChildFieldDefinition } from '../../core/models/child-field-definition';
import { ChildRowErrors } from '../../core/models/child-row-errors';
import { DateUtilsService } from '../../core/services/date-utils-service';
import { ConfirmDialogService } from '../services/confirm-dialog-service';
import { DynamicDialogService } from '../services/dynamic-dialog-service';
import { ChildItemDialogComponent } from '../components/child-entity-list/child-item-dialog/child-item-dialog.component';

const EMPTY_ROW_ERRORS: ChildRowErrors = { fields: {}, messages: [] };

interface ChildEditorState {
    /** Chave da linha em edição, ou `null` na criação. */
    rowKey: number | null;
    isNew: boolean;

    /** `true` quando o modal está em modo somente leitura (visualização). */
    readOnly: boolean;
}

/**
 * Estado compartilhado de uma lista de itens filhos (1:N) dentro de um
 * formulário pai. Concentra tudo o que os modos de visualização precisam:
 * itens em memória, chaves de linha estáveis, diffing, remoção, editor ativo e
 * normalização/aplicação dos erros da API.
 *
 * As views de apresentação (`SummaryTableComponent` e, futuramente,
 * `InlineEditTableComponent`) nunca manipulam o array — apenas leem estado e
 * emitem intents. Trocar o modo de visualização, portanto, não exige reescrever
 * nada de estado ou de erro.
 */
export class ChildEntityListFacade<T> implements ChildItemEditor<T> {
    private confirmDialogService: ConfirmDialogService = inject(ConfirmDialogService);
    private dialogService: DynamicDialogService = inject(DynamicDialogService);
    private dateUtils: DateUtilsService = inject(DateUtilsService);

    private _items: WritableSignal<T[]> = signal<T[]>([]);
    private _rowKeys: WritableSignal<number[]> = signal<number[]>([]);
    private _errors: WritableSignal<ChildErrorsIndex> = signal<ChildErrorsIndex>({});
    private _unmappedErrors: WritableSignal<KeyValue<string, string>[]> = signal<KeyValue<string, string>[]>([]);
    private _disabled: WritableSignal<boolean> = signal<boolean>(false);
    private _editor: WritableSignal<ChildEditorState | null> = signal<ChildEditorState | null>(null);
    private _baseline: WritableSignal<string> = signal<string>('');
    private _lastEmitted: WritableSignal<string> = signal<string>('');

    private nextRowKey = 1;
    private changeHandler: (value: unknown[]) => void = () => {};

    items: Signal<T[]> = this._items.asReadonly();
    rowKeys: Signal<number[]> = this._rowKeys.asReadonly();
    disabled: Signal<boolean> = this._disabled.asReadonly();
    errors: Signal<ChildErrorsIndex> = this._errors.asReadonly();

    /** Erros que não seguem o padrão `arrayKey.indice[.campo]` (banner do pai). */
    unmappedErrors: Signal<KeyValue<string, string>[]> = this._unmappedErrors.asReadonly();

    count: Signal<number> = computed(() => this._items().length);
    isEmpty: Signal<boolean> = computed(() => this._items().length === 0);

    /** Quantidade de itens com erro de validação da API. */
    invalidItemCount: Signal<number> = computed(() => Object.keys(this._errors()).length);

    hasErrors: Signal<boolean> = computed(() => this.invalidItemCount() > 0);

    /** Itens alterados em relação à última carga (uso de diffing). */
    hasChanges: Signal<boolean> = computed(() => this.snapshot() !== this._baseline());

    isEditing: Signal<boolean> = computed(() => this._editor() !== null);

    // ---- ChildItemEditor: rótulos e estado do modal ------------------------------

    itemLabel: Signal<string> = computed(() => this.config.itemLabel ?? 'Item');
    itemsLabel: Signal<string> = computed(() => this.config.itemsLabel ?? 'Itens');
    addLabel: Signal<string> = computed(() => this.config.addLabel ?? 'Incluir');
    submitLabel: Signal<string> = computed(() => this.config.submitLabel ?? 'Salvar');
    cancelLabel: Signal<string> = computed(() => this.config.cancelLabel ?? 'Voltar');
    createLabel: Signal<string> = computed(() => `${this.addLabel()} ${this.itemLabel()}`);
    editLabel: Signal<string> = computed(() => `Editar ${this.itemLabel()}`);
    viewLabel: Signal<string> = computed(() => this.config.viewLabel ?? 'Visualizar');
    emptyMessage: Signal<string> = computed(() => this.config.emptyMessage ?? 'Nenhum registro encontrado.');

    formComponent: Type<ChildEntityForm<T>>;

    isNew: Signal<boolean> = computed(() => this._editor()?.isNew ?? false);

    /** `true` quando o modal ativo está em modo somente leitura (visualização). */
    readOnly: Signal<boolean> = computed(() => this._editor()?.readOnly ?? false);

    activeItem: Signal<T | null> = computed<T | null>(() => {
        const editor = this._editor();

        if (!editor) {
            return null;
        }

        if (editor.isNew) {
            return this.config.createItem();
        }

        return this._items()[this.indexOf(editor.rowKey)] ?? null;
    });

    activeErrors: Signal<ChildRowErrors> = computed<ChildRowErrors>(() => {
        const rowKey = this._editor()?.rowKey;

        return rowKey == null ? EMPTY_ROW_ERRORS : this._errors()[rowKey] ?? EMPTY_ROW_ERRORS;
    });

    constructor(private config: ChildEntityListConfig<T>) {
        const formComponent = config.formComponent;

        if (config.viewMode === ChildEntityViewMode.ReadonlyTableModal && !formComponent) {
            throw new Error(
                `O modo '${ChildEntityViewMode.ReadonlyTableModal}' exige 'formComponent' com o formulário de '${config.itemLabel ?? 'item'}'.`
            );
        }

        this.formComponent = formComponent as Type<ChildEntityForm<T>>;
    }

    /** Colunas da tabela resumida. */
    get columns(): ChildFieldDefinition[] {
        return this.config.columns;
    }

    // ---- Integração com o formulário pai (ControlValueAccessor) -----------------

    registerOnChange(handler: (value: unknown[]) => void): void {
        this.changeHandler = handler;
    }

    setDisabledState(isDisabled: boolean): void {
        this._disabled.set(isDisabled);
    }

    /**
     * Carrega os itens vindos do pai (após um `patchValue` da API) sem marcar
     * alteração. Atribui chaves de linha estáveis e zera os erros.
     */
    writeValue(value: unknown): void {
        this.hydrate(Array.isArray(value) ? (value as unknown[]) : []);
    }

    hydrate(items: unknown[]): void {
        this._items.set(items.map(item => this.hydrateItem(item as T)));
        this._rowKeys.set(items.map(() => this.nextRowKey++));
        this._errors.set({});
        this._unmappedErrors.set([]);

        const snapshot = this.snapshot();
        this._baseline.set(snapshot);
        this._lastEmitted.set(snapshot);
    }

    /** Itens serializados para o payload do pai. */
    value(): unknown[] {
        return this._items().map(item => this.serializeItem(item));
    }

    // ---- Intenções das views ------------------------------------------------------

    /** Abre o editor. No modo tabela resumida, abre o modal em modo criação. */
    add(): void {
        if (!this._disabled()) {
            this.startEdit(null);
        }
    }

    /** Abre o editor para a linha informada. */
    edit(index: number): void {
        const rowKey = this._rowKeys()[index];

        if (!this._disabled() && rowKey != null) {
            this.startEdit(rowKey);
        }
    }

    /**
     * Abre o item em modo somente leitura (visualização). Diferente de `add` e
     * `edit`, **não** depende do estado desabilitado da lista: apenas consulta
     * o item, sem alterá-lo, portanto continua disponível no modo visualizar.
     */
    view(index: number): void {
        const rowKey = this._rowKeys()[index];

        if (rowKey != null) {
            this.startView(rowKey);
        }
    }

    /** Remove a linha, confirmando quando o config define uma mensagem. */
    async remove(index: number): Promise<void> {
        const item = this._items()[index];

        if (item === undefined) {
            return;
        }

        const message = this.config.removeConfirmMessage?.(item);

        if (message && !(await this.confirmDialogService.confirm({ message }))) {
            return;
        }

        const rowKey = this._rowKeys()[index];

        this._items.update(items => items.filter((_, position) => position !== index));
        this._rowKeys.update(keys => keys.filter((_, position) => position !== index));
        this._editor.update(editor => (editor?.rowKey === rowKey ? null : editor));
        this._errors.update(errors => this.withoutRow(errors, rowKey));

        this.emitChange();
    }

    // ---- Editor (ChildItemEditor) --------------------------------------------------

    commit(value: unknown): void {
        const editor = this._editor();

        if (!editor) {
            return;
        }

        if (editor.isNew) {
            this._items.update(items => [...items, value as T]);
            this._rowKeys.update(keys => [...keys, this.nextRowKey++]);
        } else {
            const index = this.indexOf(editor.rowKey);

            if (index < 0) {
                this.close();
                return;
            }

            this._items.update(items => items.map((item, position) => (position === index ? value as T : item)));
        }

        this._errors.update(errors => this.withoutRow(errors, editor.rowKey ?? undefined));

        this.close();
        this.emitChange();
    }

    close(): void {
        this._editor.set(null);
        this.dialogService.close();
    }

    /**
     * Aplica ao formulário do componente ativo os erros normalizados do item em
     * edição. É o facade — e não a view — quem conhece a estrutura indexada de
     * erros, por isso isso funciona com qualquer componente de formulário
     * injetado no modal.
     */
    applyActiveErrors(form: FormGroup | null): void {
        if (!form) {
            return;
        }

        const { fields, messages } = this.activeErrors();

        Object.entries(fields).forEach(([field, fieldMessages]) => {
            const control = form.get(field);

            if (!control) {
                return;
            }

            this.setServerError(control, fieldMessages);
        });

        if (messages.length) {
            this.setServerError(form, messages);
        }
    }

    // ---- Erros --------------------------------------------------------------------

    /**
     * Normaliza o mapa de erros da API para uma estrutura indexada por item e
     * campo. É a única implementação de parsing do padrão: a superfície de
     * apresentação muda por modo, a normalização não.
     *
     * Chaves reconhecidas (com `arrayKey` = `contacts`):
     * - `contacts.2.name`  → campo `name` do item de índice 2
     * - `contacts.2.address.street` → campo aninhado
     * - `contacts.2`       → erro do item, sem campo
     *
     * Qualquer outra chave (inclusive regras novas, nunca previstas no front)
     * cai em `unmappedErrors` — ela aparece no banner, sem exigir alteração de
     * código, desde que siga o padrão `arrayKey.indice[.campo]`.
     */
    applyServerErrors(errors?: Record<string, string[]>): void {
        const rows: ChildErrorsIndex = {};
        const unmapped: KeyValue<string, string>[] = [];
        const keys = this._rowKeys();

        Object.entries(errors ?? {}).forEach(([path, rawMessages]) => {
            const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages];
            const segments = path.split('.');
            const index = Number(segments[1]);

            if (
                segments[0] !== this.config.arrayKey ||
                segments.length < 2 ||
                !Number.isInteger(index) ||
                index < 0 ||
                index >= keys.length
            ) {
                unmapped.push({ key: path, value: messages[0] });
                return;
            }

            const rowKey = keys[index];
            const row = rows[rowKey] ?? { fields: {}, messages: [] };

            if (segments.length === 2) {
                row.messages.push(...messages);
            } else {
                const field = segments.slice(2).join('.');
                row.fields[field] = [...(row.fields[field] ?? []), ...messages];
            }

            rows[rowKey] = row;
        });

        this._errors.set(rows);
        this._unmappedErrors.set(unmapped);
    }

    /** `true` quando o caminho pertence a esta lista (`contacts.2.name`). */
    handlesErrorPath(path: string): boolean {
        const [arrayKey, index] = path.split('.');

        if (arrayKey !== this.config.arrayKey || index === undefined) {
            return false;
        }

        const position = Number(index);

        return Number.isInteger(position) && position >= 0 && position < this._rowKeys().length;
    }

    rowErrors(index: number): ChildRowErrors {
        const rowKey = this._rowKeys()[index];

        return rowKey == null ? EMPTY_ROW_ERRORS : this._errors()[rowKey] ?? EMPTY_ROW_ERRORS;
    }

    fieldErrors(index: number, field: string): string[] {
        return this.rowErrors(index).fields[field] ?? [];
    }

    /** Total de mensagens do item — usado no indicador da linha. */
    itemErrorCount(index: number): number {
        const { fields, messages } = this.rowErrors(index);

        return (
            messages.length +
            Object.values(fields).reduce((total, fieldMessages) => total + fieldMessages.length, 0)
        );
    }

    // ---- Internos ------------------------------------------------------------------

    private startEdit(rowKey: number | null): void {
        this.assertReadonlyTable();
        this._editor.set({ rowKey, isNew: rowKey == null, readOnly: false });

        const title = rowKey == null ? this.createLabel() : this.editLabel();
        this.openDialog(title);
    }

    private startView(rowKey: number): void {
        this.assertReadonlyTable();
        this._editor.set({ rowKey, isNew: false, readOnly: true });

        this.openDialog(`${this.viewLabel()} ${this.itemLabel()}`);
    }

    private assertReadonlyTable(): void {
        if (this.config.viewMode !== ChildEntityViewMode.ReadonlyTableModal) {
            // Ponto de extensão para ChildEntityViewMode.InlineTable: a edição
            // ocorre por célula, na própria linha, sem modal.
            throw new Error(`Modo de visualização '${this.config.viewMode}' ainda não implementado.`);
        }
    }

    private openDialog(title: string): void {
        const closed = this.dialogService.open<unknown>(ChildItemDialogComponent, {
            title,
            size: this.config.dialogSize ?? DialogSize.Medium,
            data: this,
        });

        void closed.then(() => this._editor.set(null));
    }

    private setServerError(target: AbstractControl, messages: string[]): void {
        target.setErrors({ ...target.errors, server: messages });
        target.markAsTouched();

        target.valueChanges.pipe(take(1)).subscribe(() => {
            const { server: _server, ...rest } = target.errors ?? {};
            target.setErrors(Object.keys(rest).length ? rest : null);
        });
    }

    private withoutRow(errors: ChildErrorsIndex, rowKey: number | undefined): ChildErrorsIndex {
        if (rowKey == null) {
            return errors;
        }

        return Object.fromEntries(Object.entries(errors).filter(([key]) => Number(key) !== rowKey));
    }

    private indexOf(rowKey: number | null): number {
        return rowKey == null ? -1 : this._rowKeys().indexOf(rowKey);
    }

    /**
     * Emite a alteração ao formulário pai apenas quando o valor serializado de
     * fato mudou (diffing), evitando o ciclo de `writeValue` do próprio CVA.
     */
    private emitChange(): void {
        const snapshot = this.snapshot();

        if (snapshot === this._lastEmitted()) {
            return;
        }

        this._lastEmitted.set(snapshot);
        this.changeHandler(this.value());
    }

    private snapshot(): string {
        return JSON.stringify(this.value());
    }

    private hydrateItem(item: T): T {
        return this.config.hydrateItem
            ? this.config.hydrateItem(item)
            : (this.hydrateValue(item) as T);
    }

    private serializeItem(item: T): unknown {
        return this.config.serializeItem
            ? this.config.serializeItem(item)
            : serializeValue(item, date => this.dateUtils.formatIsoDate(date));
    }

    /**
     * Hidrata recursivamente datas ISO e lookups de um item. A recursão é feita
     * por valor: cada entrada é hidratada antes de o objeto ser devolvido, e o
     * objeto nunca é reidratado contra si mesmo.
     */
    private hydrateValue(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map(entry => this.hydrateValue(entry));
        }

        if (this.isPlainObject(value)) {
            const hydrated: Record<string, unknown> = {};

            Object.entries(value).forEach(([key, entry]) => {
                hydrated[key] = this.hydrateValue(entry);
            });

            return this.dateUtils.parseIsoDates(hydrated);
        }

        return value;
    }

    private isPlainObject(value: unknown): value is Record<string, unknown> {
        if (value === null || typeof value !== 'object') {
            return false;
        }

        const prototype = Object.getPrototypeOf(value);

        return prototype === Object.prototype || prototype === null;
    }
}
