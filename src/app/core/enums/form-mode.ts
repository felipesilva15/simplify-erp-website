export enum FormMode {
    CREATE = 'create',
    VIEW = 'view',
    EDIT = 'edit'
}

export const FormModeLabel: Record<FormMode, string> = {
    [FormMode.CREATE]: 'Incluir',
    [FormMode.EDIT]: 'Editar',
    [FormMode.VIEW]: 'Visualizar'
};