import { ChildEntityListConfig } from '../../../../core/models/child-entity-list-config';
import { ChildEntityViewMode } from '../../../../core/enums/child-entity-view-mode';
import { ColumnType } from '../../../../core/enums/column-type';
import { DialogSize } from '../../../../core/enums/dialog-size';
import { ContactFormComponent } from '../components/contact-form/contact-form.component';
import { Contact } from '../models/contact';
import { PhonePipe } from '../../../../shared/pipes/phone-pipe';

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
    itemLabel: 'contato',
    itemsLabel: '',
    columns: [
        { field: 'name', header: 'Nome' },
        { field: 'department', header: 'Departamento' },
        { field: 'phone', header: 'Telefone', pipe: new PhonePipe() },
        { field: 'mobile', header: 'Celular', pipe: new PhonePipe() },
        { field: 'email', header: 'E-mail' },
        { field: 'main', header: 'Principal', type: ColumnType.Boolean },
    ],
    createItem: () => ({
        id: 0,
        name: '',
        main: false,
    }),
    formComponent: ContactFormComponent,
    dialogSize: DialogSize.Small,
    removeConfirmMessage: (contact: Contact) => `Deseja realmente remover o contato "${contact.name}"?`,
};