import { ChildEntityListConfig } from '../../../../core/models/child-entity-list-config';
import { ChildEntityViewMode } from '../../../../core/enums/child-entity-view-mode';
import { ColumnType } from '../../../../core/enums/column-type';
import { DialogSize } from '../../../../core/enums/dialog-size';
import { ContactFormComponent } from '../components/contact-form/contact-form.component';
import { Contact } from '../models/contact';

/**
 * Configuração da lista de contatos dentro do formulário do parceiro.
 *
 * É a referência de uso do padrão: para publicar outra entidade filha 1:N basta
 * declarar esta configuração (colunas resumidas, rótulos, item em branco e o
 * componente de formulário usado no modal).
 */
export const CONTACTS_LIST_CONFIG: ChildEntityListConfig<Contact> = {
    arrayKey: 'contacts',
    viewMode: ChildEntityViewMode.ReadonlyTableModal,
    itemLabel: 'Contato',
    itemsLabel: 'Contatos',
    columns: [
        { field: 'name', header: 'Nome' },
        { field: 'position', header: 'Cargo' },
        { field: 'phone', header: 'Telefone' },
        { field: 'email', header: 'E-mail' },
        { field: 'is_primary', header: 'Principal', type: ColumnType.Boolean },
    ],
    createItem: () => ({
        id: 0,
        name: '',
        phone: '',
        is_primary: false,
    }),
    formComponent: ContactFormComponent,
    dialogSize: DialogSize.Large,
    removeConfirmMessage: (contact: Contact) => `Deseja realmente remover o contato "${contact.name}"?`,
};