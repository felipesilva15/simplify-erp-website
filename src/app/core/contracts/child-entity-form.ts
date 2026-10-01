import { Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ChildRowErrors } from '../models/child-row-errors';

/**
 * Contrato do componente de formulário de um item filho, instanciado
 * dinamicamente dentro do shell do modal (`ChildItemDialogComponent`).
 *
 * Segue o mesmo princípio ISP dos demais contratos do projeto
 * (`LookupService`, `LogableService`): o shell conhece apenas o mínimo
 * necessário para conversar com o formulário, e nunca o schema de campos.
 *
 * O componente concreto é de responsabilidade da entidade e deve:
 * - obter `item` e `errors` por injeção (`CHILD_FORM_ITEM` / `CHILD_FORM_ERRORS`);
 * - expor o `FormGroup` para que o facade aplique os erros da API;
 * - chamar `editor.commit(...)` em `submit()` e `editor.close()` em `cancel()`.
 */
export interface ChildEntityForm<T> {
    /** Item em edição (ou `null` na criação). */
    readonly item: Signal<T | null>;

    /** Erros normalizados do item em edição, vindos da API. */
    readonly errors: Signal<ChildRowErrors>;

    /** Formulário do item, usado pelo facade para aplicar os erros. */
    readonly form: FormGroup;

    /** Valida e confirma o item. */
    submit(): void;

    /** Descarta a edição. */
    cancel(): void;
}
