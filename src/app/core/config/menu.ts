import { AppMenuItem } from "../models/app-menu-item";

export const MENU: AppMenuItem[] = [
  {
    label: 'Segurança',
    icon: 'pi pi-shield',
    items: [
      {
        label: 'Usuários',
        icon: 'pi pi-users',
        routerLink: '/users',
        permission: 'users.list'
      },
      {
        label: 'Papéis',
        icon: 'pi pi-id-card',
        routerLink: '/roles',
        permission: 'roles.list'
      }
    ]
  },
  {
    label: 'Financeiro',
    icon: 'pi pi-wallet',
    routerLink: '/financeiro',
    permission: 'financial.list'
  }
];