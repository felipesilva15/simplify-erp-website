import { FormGroup } from '@angular/forms';
import { ApiResponse } from '../../../../core/models/api-response';
import { Contact } from '../../contacts/models/contact';
import { ChildEntityListFacade } from '../../../../shared/facades/child-entity-list.facade';
import { CrudService } from '../../../../core/contracts/crud-service';
import { Partner } from '../models/partner';
import { GenericCrudFormFacade } from '../../../../shared/facades/generic-crud-form.facade';

/**
 * Facade do formulário do parceiro, sobre o `GenericCrudFormFacade`.
 *
 * Existe apenas para delegar os erros das entidades filhas ao
 * `ChildEntityListFacade` da lista, em vez de deixá-los no banner genérico:
 * cada item filho tem sua própria superfície de erro (no modal, por campo).
 */
export class PartnerFormFacade extends GenericCrudFormFacade<Partner> {
    constructor(
        service: CrudService<Partner>,
        private contactsFacade: ChildEntityListFacade<Contact>,
        config?: ConstructorParameters<typeof GenericCrudFormFacade<Partner>>[1],
    ) {
        super(service, config);
    }

    /**
     * Caminhos `contacts.indice[.campo]` são tratados pela lista; o restante
     * segue para o banner genérico de `serverErrors`.
     */
    protected override isHandledServerErrorPath(path: string): boolean {
        return this.contactsFacade.handlesErrorPath(path);
    }

    /** Repasse dos erros da API para a lista de contatos. */
    override applyServerErrors(form: FormGroup, response: ApiResponse<undefined>): void {
        const errors = response.errors;

        if (errors) {
            // Apenas os caminhos desta lista; o resto é responsabilidade do
            // banner genérico do facade do pai.
            const contactsErrors = Object.fromEntries(
                Object.entries(errors).filter(([path]) => path.split('.')[0] === 'contacts')
            );

            this.contactsFacade.applyServerErrors(contactsErrors);
        }

        super.applyServerErrors(form, response);
    }
}