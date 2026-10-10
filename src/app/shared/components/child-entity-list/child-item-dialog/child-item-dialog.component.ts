import { ChangeDetectionStrategy, Component, effect, inject, Signal, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageModule } from 'primeng/message';
import { ChildItemEditor } from '../../../../core/contracts/child-item-editor';
import { ChildRowErrors } from '../../../../core/models/child-row-errors';
import { ChildFormOutletDirective } from '../../../directives/child-form-outlet.directive';
import { AppTemplate } from '../../../directives/app-template';
import { FormDialogUi } from '../../../ui/form-dialog/form-dialog.ui';

/**
 * Shell genérico do modal de um item filho: título, botões de ação e
 * abertura/fechamento. O conteúdo é sempre o componente de formulário concreto
 * da entidade, instanciado dinamicamente por `ChildFormOutletDirective` — o
 * shell não conhece o schema de campos.
 *
 * Recebe o editor como `data` do dialog, pois é criado pelo PrimeNG fora do
 * injector da página.
 *
 * No modo somente leitura (`editor.readOnly()`), o formulário é desabilitado de
 * forma genérica (`FormGroup.disable`) e a ação de confirmação é ocultada — o
 * modal vira apenas um visualizador do item.
 */
@Component({
    selector: 'app-child-item-dialog',
    imports: [
        AppTemplate,
        FormDialogUi,
        ChildFormOutletDirective,
        ButtonModule,
        MessageModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block' },
    templateUrl: './child-item-dialog.component.html',
})
export class ChildItemDialogComponent {
    private dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
    private dialogRef: DynamicDialogRef = inject(DynamicDialogRef);

    /**
     * Sinal de query em vez de `@ViewChild`: permite ao `effect` reagir tanto à
     * criação do formulário quanto à mudança dos erros normalizados.
     */
    formOutlet = viewChild(ChildFormOutletDirective);

    editor: ChildItemEditor<unknown> = this.dialogConfig.data as ChildItemEditor<unknown>;

    constructor() {
        effect(() => {
            const form = this.formOutlet()?.form ?? null;

            if (this.editor.readOnly()) {
                form?.disable({ emitEvent: false });
                return;
            }

            this.editor.applyActiveErrors(form);
        });
    }

    activeErrors: Signal<ChildRowErrors> = this.editor.activeErrors;

    readOnly: Signal<boolean> = this.editor.readOnly;

    onSubmit(): void {
        this.formOutlet()?.instance?.submit();
    }

    onCancel(): void {
        this.formOutlet()?.instance?.cancel();
    }

    close(): void {
        this.dialogRef.close();
    }
}
