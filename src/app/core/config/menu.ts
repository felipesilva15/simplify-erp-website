import { AppMenuItem } from "../models/app-menu-item";

export const MENU: AppMenuItem[] = [
  {
    label: 'Home',
    icon: 'pi pi-home',
    routerLink: '/',
    permission: 'home.viewAny'
  },
  {
    label: 'Configurações',
    icon: 'pi pi-cog',
    routerLink: '/',
    permission: 'core.configurations'
  },
  {
    label: 'Segurança',
    icon: 'pi pi-lock',
    items: [
      {
        label: 'Usuários',
        icon: 'pi pi-users',
        routerLink: '/users',
        permission: 'users.viewAny'
      },
      {
        label: 'Papéis',
        icon: 'pi pi-star',
        routerLink: '/roles',
        permission: 'roles.viewAny'
      }
    ]
  }
];