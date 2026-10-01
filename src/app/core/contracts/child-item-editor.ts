import { Signal, Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ChildEntityForm } from './child-entity-form';
import { ChildRowErrors } from '../models/child-row-errors';

/**
 * Superfície que o shell do modal (`ChildItemDialogComponent`) consome do
 * facade de itens filhos.
 *
 * O dialog é criado pelo PrimeNG fora do injector da página, então ele conversa
 * com o facade por esta interface — passada como `data` na abertura — e não
 * com a classe concreta. Isso mantém o shell genérico desacoplado de qualquer
 * entidade.
 */
export interface ChildItemEditor<T> {
    /** Componente de formulário concreto da entidade, instanciado no modal. */
    readonly formComponent: Type<ChildEntityForm<T>>;

    /** Rótulo singular do item, usado no título do modal. */
    readonly itemLabel: Signal<string>;

    /** Rótulo do item quando o modal está em modo criação. */
    readonly createLabel: Signal<string>;

    /** Rótulo do item quando o modal está em modo edição. */
    readonly editLabel: Signal<string>;

    /** Rótulo do botão de confirmação. */
    readonly submitLabel: Signal<string>;

    /** Rótulo do cancelamento. */
    readonly cancelLabel: Signal<string>;

    /** `true` quando o modal está criando um item novo. */
    readonly isNew: Signal<boolean>;

    /** Item em edição (ou `null` enquanto nenhum item está aberto). */
    readonly activeItem: Signal<T | null>;

    /** Erros do item em edição, para exibição inline dentro do formulário. */
    readonly activeErrors: Signal<ChildRowErrors>;

    /**
     * Aplica os erros normalizados ao formulário do componente ativo.
     * Implementado pelo facade compartilhado — é ele quem conhece a estrutura
     * indexada de erros, independentemente do componente injetado.
     */
    applyActiveErrors(form: FormGroup | null): void;

    /** Confirma o valor devolvido pelo componente de formulário. */
    commit(value: unknown): void;

    /** Fecha o modal sem confirmar. */
    close(): void;
}
