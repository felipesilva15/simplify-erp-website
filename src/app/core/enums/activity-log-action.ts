export enum ActivityLogAction {
    Created = 'CREATED',
    Updated = 'UPDATED',
    Deleted = 'DELETED',
    Approved = 'APPROVED',
    Auth = 'AUTH'
}

export const ActivityLogActionLabels: Record<ActivityLogAction, string> = {
    [ActivityLogAction.Created]: 'Criado',
    [ActivityLogAction.Updated]: 'Atualizado',
    [ActivityLogAction.Deleted]: 'Excluído',
    [ActivityLogAction.Approved]: 'Aprovado',
    [ActivityLogAction.Auth]: 'Autenticado'
};
  
export const ActivityLogActionOptions: { code: ActivityLogAction, name: string }[] = (Object.keys(ActivityLogAction) as (keyof typeof ActivityLogAction)[])
.map(key => ({
    code: ActivityLogAction[key] as ActivityLogAction,
    name: ActivityLogActionLabels[ActivityLogAction[key] as ActivityLogAction],
}));