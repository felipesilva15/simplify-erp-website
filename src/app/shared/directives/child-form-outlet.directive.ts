import {
    ComponentRef,
    Directive,
    EnvironmentInjector,
    inject,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewContainerRef,
    createComponent,
    signal,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ChildEntityForm } from '../../core/contracts/child-entity-form';
import { ChildItemEditor } from '../../core/contracts/child-item-editor';
import { CHILD_FORM_ERRORS, CHILD_FORM_ITEM, CHILD_ITEM_EDITOR } from '../../core/models/child-form-tokens';

/**
 * Diretiva estrutural que instancia dinamicamente o componente de formulário
 * do item filho dentro do shell do modal, análoga ao `DrawerOutletDirective`.
 *
 * Uso:
 * ```html
 * <ng-container *appChildFormOutlet="editor"></ng-container>
 * ```
 *
 * O componente alvo é o `formComponent` declarado no editor e recebe via
 * injeção:
 * - `CHILD_FORM_ITEM`   -> `Signal<T | null>` com o item em edição;
 * - `CHILD_FORM_ERRORS` -> `Signal<ChildRowErrors>` com os erros normalizados;
 * - `CHILD_ITEM_EDITOR` -> `ChildItemEditor`, para confirmar/cancelar.
 *
 * A diretiva expõe o `FormGroup` do componente criado para que o facade
 * compartilhado aplique os erros da API, independentemente de qual componente
 * concreto foi injetado.
 */
@Directive({
    selector: '[appChildFormOutlet]',
})
export class ChildFormOutletDirective implements OnInit, OnDestroy {
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly environmentInjector = inject(EnvironmentInjector);
    private readonly injector = inject(Injector);

    /** Editor compartilhado; o componente instanciado é o seu `formComponent`. */
    @Input({ required: true }) appChildFormOutlet!: ChildItemEditor<unknown>;

    private componentRef: ComponentRef<unknown> | null = null;

    /** `true` quando o componente expõe um `FormGroup` (`ChildEntityForm`). */
    readonly created = signal<boolean>(false);

    ngOnInit(): void {
        this.render();
    }

    ngOnDestroy(): void {
        this.componentRef?.destroy();
        this.componentRef = null;
        this.created.set(false);
    }

    /** Formulário do componente criado, quando ele implementa `ChildEntityForm`. */
    get form(): FormGroup | null {
        const form = (this.componentRef?.instance as { form?: FormGroup } | null)?.form;

        return form instanceof FormGroup ? form : null;
    }

    get instance(): ChildEntityForm<unknown> | null {
        const instance = this.componentRef?.instance as Partial<ChildEntityForm<unknown>> | undefined;

        return instance && typeof instance.submit === 'function' && typeof instance.cancel === 'function'
            ? (instance as ChildEntityForm<unknown>)
            : null;
    }

    private render(): void {
        this.viewContainerRef.clear();
        this.componentRef = null;
        this.created.set(false);

        if (!this.appChildFormOutlet?.formComponent) {
            return;
        }

        const childInjector = Injector.create({
            parent: this.injector,
            providers: [
                { provide: CHILD_FORM_ITEM, useValue: this.appChildFormOutlet.activeItem },
                { provide: CHILD_FORM_ERRORS, useValue: this.appChildFormOutlet.activeErrors },
                { provide: CHILD_ITEM_EDITOR, useValue: this.appChildFormOutlet },
            ],
        });

        this.componentRef = createComponent(this.appChildFormOutlet.formComponent, {
            environmentInjector: this.environmentInjector,
            elementInjector: childInjector,
        });

        this.viewContainerRef.insert(this.componentRef.hostView);
        this.componentRef.changeDetectorRef.detectChanges();
        this.created.set(true);
    }
}
