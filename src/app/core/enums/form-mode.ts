export enum FormMode {
    Create = 'CREATE',
    View = 'VIEW',
    Edit = 'EDIT'
}

export const FormModeLabel: Record<FormMode, string> = {
    [FormMode.Create]: 'Incluir',
    [FormMode.Edit]: 'Editar',
    [FormMode.View]: 'Visualizar'
};