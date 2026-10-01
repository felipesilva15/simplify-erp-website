import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ChildEntityListFacade } from './child-entity-list.facade';
import { ChildEntityViewMode } from '../../core/enums/child-entity-view-mode';
import { DialogSize } from '../../core/enums/dialog-size';
import { LookupItem } from '../../core/models/lookup-item';
import { ChildRowErrors } from '../../core/models/child-row-errors';
import { ChildEntityForm } from '../../core/contracts/child-entity-form';
import { ChildEntityListConfig } from '../../core/models/child-entity-list-config';
import { ChildEntityListComponent } from '../components/child-entity-list/child-entity-list.component';
import { ConfirmationService } from 'primeng/api';

import { ConfirmDialogService } from '../services/confirm-dialog-service';
import { DynamicDialogService } from '../services/dynamic-dialog-service';

interface TestItem {
    id: number;
    name: string;
    amount?: number;
    kind?: LookupItem | null;
}

class TestFormComponent implements ChildEntityForm<TestItem> {
    readonly form = new FormGroup({
        name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });

    readonly item = signal<TestItem | null>(null);
    readonly errors = signal<ChildRowErrors>({ fields: {}, messages: [] });

    submit(): void {}
    cancel(): void {}
}

function createConfig(
    overrides: Partial<ChildEntityListConfig<TestItem>> = {},
): ChildEntityListConfig<TestItem> {
    return {
        arrayKey: 'children',
        viewMode: ChildEntityViewMode.ReadonlyTableModal,
        itemLabel: 'Item',
        itemsLabel: 'Itens',
        columns: [{ field: 'name', header: 'Nome' }],
        createItem: () => ({ id: 0, name: '' }),
        formComponent: TestFormComponent,
        dialogSize: DialogSize.Medium,
        ...overrides,
    };
}

describe('ChildEntityListFacade', () => {
    let confirmDialogService: { confirm: ReturnType<typeof vi.fn> };
    let dialogService: { open: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> };

    function createFacade(
        config: ChildEntityListConfig<TestItem> = createConfig(),
    ): ChildEntityListFacade<TestItem> {
        // O facade usa `inject()` em inicializadores de campo, então precisa ser
        // instanciado dentro de um contexto de injeção.
        return TestBed.runInInjectionContext(() => new ChildEntityListFacade<TestItem>(config));
    }

    beforeEach(() => {
        confirmDialogService = { confirm: vi.fn(() => Promise.resolve(true)) };
        dialogService = { open: vi.fn(() => Promise.resolve(undefined)), close: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                { provide: ConfirmDialogService, useValue: confirmDialogService },
                { provide: DynamicDialogService, useValue: dialogService },
            ],
        });
    });

    describe('constructor', () => {
        it('should throw when ReadonlyTableModal has no formComponent', () => {
            const config = createConfig({ formComponent: undefined });

            expect(() => createFacade(config)).toThrowError(/formComponent/);
        });

        it('should accept InlineTable without a formComponent', () => {
            const config = createConfig({
                viewMode: ChildEntityViewMode.InlineTable,
                formComponent: undefined,
            });

            expect(() => createFacade(config)).not.toThrow();
        });
    });

    describe('labels', () => {
        it('should use the configured labels', () => {
            const facade = createFacade(createConfig({ itemLabel: 'Contato', itemsLabel: 'Contatos' }));

            expect(facade.itemLabel()).toBe('Contato');
            expect(facade.itemsLabel()).toBe('Contatos');
        });

        it('should fall back to the defaults', () => {
            const facade = createFacade();

            expect(facade.itemLabel()).toBe('Item');
            expect(facade.itemsLabel()).toBe('Itens');
            expect(facade.addLabel()).toBe('Incluir');
            expect(facade.submitLabel()).toBe('Salvar');
            expect(facade.cancelLabel()).toBe('Voltar');
            expect(facade.emptyMessage()).toBe('Nenhum registro encontrado.');
            expect(facade.createLabel()).toBe('Incluir Item');
            expect(facade.editLabel()).toBe('Editar Item');
        });
    });

    describe('hydrate / value', () => {
        it('should start empty', () => {
            const facade = createFacade();

            expect(facade.items()).toEqual([]);
            expect(facade.count()).toBe(0);
            expect(facade.isEmpty()).toBe(true);
        });

        it('should assign new row keys on every load', () => {
            const facade = createFacade();

            facade.writeValue([{ id: 1, name: 'A' }]);
            const firstKeys = [...facade.rowKeys()];

            facade.writeValue([{ id: 1, name: 'A' }]);

            expect(facade.rowKeys()).not.toEqual(firstKeys);
            expect(facade.rowKeys().length).toBe(1);
        });

        it('should not mark changes after a load', () => {
            const facade = createFacade();

            facade.writeValue([{ id: 1, name: 'A' }]);

            expect(facade.hasChanges()).toBe(false);
        });

        it('should ignore non-array values', () => {
            const facade = createFacade();

            facade.writeValue(null);

            expect(facade.items()).toEqual([]);
        });

        it('should unwrap lookups on serialize', () => {
            const facade = createFacade();

            facade.writeValue([{ id: 1, name: 'A', kind: { key: 'K', label: 'Rótulo', meta: {} } }]);

            expect(facade.value()[0]).toEqual({ id: 1, name: 'A', kind: 'K' });
        });

        it('should use the configured serializeItem', () => {
            const facade = createFacade(createConfig({ serializeItem: (item: TestItem) => ({ id: item.id }) }));

            facade.writeValue([{ id: 7, name: 'A' }]);

            expect(facade.value()).toEqual([{ id: 7 }]);
        });

        it('should use the configured hydrateItem', () => {
            const facade = createFacade(
                createConfig({ hydrateItem: (item: TestItem) => ({ ...item, name: item.name.toUpperCase() }) }),
            );

            facade.writeValue([{ id: 1, name: 'ana' }]);

            expect(facade.items()[0].name).toBe('ANA');
        });
    });

    describe('commit', () => {
        it('should append the item when creating', () => {
            const facade = createFacade();

            facade.add();
            facade.commit({ id: 0, name: 'Novo' });

            expect(facade.count()).toBe(1);
            expect(facade.items()[0].name).toBe('Novo');
        });

        it('should replace the item when editing', () => {
            const facade = createFacade();
            facade.writeValue([
                { id: 1, name: 'A' },
                { id: 2, name: 'B' },
            ]);

            facade.edit(1);
            facade.commit({ id: 2, name: 'B alterado' });

            expect(facade.items()[1].name).toBe('B alterado');
            expect(facade.count()).toBe(2);
        });

        it('should do nothing when there is no active editor', () => {
            const facade = createFacade();

            facade.commit({ id: 0, name: 'Novo' });

            expect(facade.count()).toBe(0);
        });

        it('should mark changes and notify the parent', () => {
            const facade = createFacade();
            const onChange = vi.fn();
            facade.registerOnChange(onChange);

            facade.add();
            facade.commit({ id: 0, name: 'Novo' });

            expect(facade.hasChanges()).toBe(true);
            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it('should clear the errors of the edited row', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);
            facade.applyServerErrors({ 'children.0.name': ['inválido'] });

            facade.edit(0);
            facade.commit({ id: 1, name: 'A' });

            expect(facade.hasErrors()).toBe(false);
        });

        it('should not notify the parent when nothing changed', () => {
            const facade = createFacade();
            const onChange = vi.fn();
            facade.registerOnChange(onChange);

            facade.edit(0);
            facade.commit({ id: 1, name: 'A' });

            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove without confirmation when the config has no message', async () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            await facade.remove(0);

            expect(confirmDialogService.confirm).not.toHaveBeenCalled();
            expect(facade.count()).toBe(0);
        });

        it('should confirm before removing when configured', async () => {
            const facade = createFacade(createConfig({ removeConfirmMessage: () => 'Remover?' }));
            facade.writeValue([{ id: 1, name: 'A' }]);

            await facade.remove(0);

            expect(confirmDialogService.confirm).toHaveBeenCalled();
            expect(facade.count()).toBe(0);
        });

        it('should keep the item when the confirmation is declined', async () => {
            confirmDialogService.confirm = vi.fn(() => Promise.resolve(false));
            const facade = createFacade(createConfig({ removeConfirmMessage: () => 'Remover?' }));
            facade.writeValue([{ id: 1, name: 'A' }]);

            await facade.remove(0);

            expect(facade.count()).toBe(1);
        });

        it('should ignore an out-of-range index', async () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            await facade.remove(5);

            expect(facade.count()).toBe(1);
        });

        it('should clear the errors of the removed row', async () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);
            facade.applyServerErrors({ 'children.0.name': ['inválido'] });

            await facade.remove(0);

            expect(facade.hasErrors()).toBe(false);
        });
    });

    describe('applyServerErrors', () => {
        it('should map a field error to the row', () => {
            const facade = createFacade();
            facade.writeValue([
                { id: 1, name: 'A' },
                { id: 2, name: 'B' },
            ]);

            facade.applyServerErrors({ 'children.1.name': ['Nome inválido'] });

            expect(facade.rowErrors(1).fields['name']).toEqual(['Nome inválido']);
            expect(facade.rowErrors(0).fields['name']).toBeUndefined();
            expect(facade.itemErrorCount(1)).toBe(1);
            expect(facade.invalidItemCount()).toBe(1);
            expect(facade.hasErrors()).toBe(true);
        });

        it('should map a nested field path', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            facade.applyServerErrors({ 'children.0.address.street': ['Rua inválida'] });

            expect(facade.rowErrors(0).fields['address.street']).toEqual(['Rua inválida']);
        });

        it('should map a row-level error', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            facade.applyServerErrors({ 'children.0': ['Item inválido'] });

            expect(facade.rowErrors(0).messages).toEqual(['Item inválido']);
        });

        it('should accumulate multiple messages for the same field', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            facade.applyServerErrors({ 'children.0.name': ['primeiro', 'segundo'] });

            expect(facade.rowErrors(0).fields['name']).toEqual(['primeiro', 'segundo']);
        });

        it('should send foreign keys to unmappedErrors', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            facade.applyServerErrors({
                'children.5.name': ['índice fora da lista'],
                'others.0.name': ['outra lista'],
                name: ['campo do pai'],
            });

            expect(facade.unmappedErrors().length).toBe(3);
            expect(facade.hasErrors()).toBe(false);
        });

        it('should replace previous errors on each call', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            facade.applyServerErrors({ 'children.0.name': ['primeiro'] });
            facade.applyServerErrors({});

            expect(facade.hasErrors()).toBe(false);
            expect(facade.rowErrors(0)).toEqual({ fields: {}, messages: [] });
        });
    });

    describe('handlesErrorPath', () => {
        it('should accept an existing index', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            expect(facade.handlesErrorPath('children.0')).toBe(true);
            expect(facade.handlesErrorPath('children.0.name')).toBe(true);
        });

        it('should reject other lists, missing and out-of-range indexes', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            expect(facade.handlesErrorPath('others.0')).toBe(false);
            expect(facade.handlesErrorPath('children')).toBe(false);
            expect(facade.handlesErrorPath('children.1')).toBe(false);
            expect(facade.handlesErrorPath('children.x')).toBe(false);
        });
    });

    describe('fieldErrors', () => {
        it('should return the messages of a field', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);
            facade.applyServerErrors({ 'children.0.name': ['inválido'] });

            expect(facade.fieldErrors(0, 'name')).toEqual(['inválido']);
            expect(facade.fieldErrors(0, 'email')).toEqual([]);
        });
    });

    describe('applyActiveErrors', () => {
        it('should set the server error on the matching control', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);
            facade.applyServerErrors({ 'children.0.name': ['Nome inválido'] });

            facade.edit(0);

            const form = new FormGroup({
                name: new FormControl('A', { nonNullable: true }),
                email: new FormControl('', { nonNullable: true }),
            });

            facade.applyActiveErrors(form);

            expect(form.get('name')?.errors?.['server']).toEqual(['Nome inválido']);
            expect(form.get('email')?.errors).toBeNull();
        });

        it('should ignore a null form', () => {
            const facade = createFacade();

            expect(() => facade.applyActiveErrors(null)).not.toThrow();
        });
    });

    describe('setDisabledState', () => {
        it('should block add and edit', () => {
            const facade = createFacade();
            facade.writeValue([{ id: 1, name: 'A' }]);

            facade.setDisabledState(true);
            facade.add();
            facade.edit(0);

            expect(dialogService.open).not.toHaveBeenCalled();
        });

        it('should allow add when enabled', () => {
            const facade = createFacade();

            facade.add();

            expect(dialogService.open).toHaveBeenCalled();
        });
    });
});

describe('ChildEntityListComponent', () => {
    let dialogService: { open: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> };
    let confirmationService: { confirm: ReturnType<typeof vi.fn> };

    /**
     * Configura o TestBed e só então cria o facade: o facade usa `inject()` em
     * inicializadores de campo, portanto precisa de um injector já configurado.
     */
    function setup(): {
        facade: ChildEntityListFacade<TestItem>;
        component: ChildEntityListComponent<TestItem>;
    } {
        const config = createConfig();

        TestBed.configureTestingModule({
            providers: [
                { provide: ConfirmDialogService, useValue: { confirm: vi.fn(() => Promise.resolve(true)) } },
                { provide: DynamicDialogService, useValue: dialogService },
                { provide: ConfirmationService, useValue: confirmationService },
                {
                    provide: ChildEntityListFacade,
                    useFactory: () => new ChildEntityListFacade<TestItem>(config),
                },
            ],
        });

        const facade = TestBed.inject(ChildEntityListFacade) as ChildEntityListFacade<TestItem>;
        const fixture = TestBed.createComponent(ChildEntityListComponent<TestItem>);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();

        return { facade, component: fixture.componentInstance };
    }

    beforeEach(() => {
        dialogService = { open: vi.fn(() => Promise.resolve(undefined)), close: vi.fn() };
        confirmationService = { confirm: vi.fn() };
    });

    it('should delegate writeValue to the facade', () => {
        const { facade, component } = setup();

        component.writeValue([{ id: 1, name: 'A' }]);

        expect(facade.count()).toBe(1);
    });

    it('should delegate setDisabledState to the facade', () => {
        const { facade, component } = setup();

        component.setDisabledState(true);

        expect(facade.disabled()).toBe(true);
    });

    it('should mark the parent as touched on every intent', () => {
        const { facade, component } = setup();
        const onTouched = vi.fn();
        component.registerOnTouched(onTouched);

        component.onAdd();

        expect(onTouched).toHaveBeenCalled();
    });

    it('should emit the serialized value to the parent on commit', () => {
        const { facade, component } = setup();
        const onChange = vi.fn();
        component.registerOnChange(onChange);

        facade.add();
        facade.commit({ id: 0, name: 'Novo' });

        expect(onChange).toHaveBeenCalledWith([{ id: 0, name: 'Novo' }]);
    });

    it('should open the editor for the informed index', () => {
        const { facade, component } = setup();
        facade.writeValue([{ id: 1, name: 'A' }]);

        component.onOpenEditor(0);

        expect(dialogService.open).toHaveBeenCalled();
    });

    it('should remove the informed index', () => {
        const { facade, component } = setup();
        facade.writeValue([{ id: 1, name: 'A' }]);

        component.onRemoveItem(0);

        expect(facade.count()).toBe(0);
    });

    it('should expose the summary view derived from the facade', () => {
        const { facade, component } = setup();
        facade.writeValue([{ id: 1, name: 'A' }]);

        const view = component.summaryView();

        expect(view.items()).toEqual([{ id: 1, name: 'A' }]);
        expect(view.columns().map(column => column.field)).toEqual(['name']);
        expect(view.itemErrorCount(0)).toBe(0);
    });
});