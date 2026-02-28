import { AppMenuItem } from "../models/app-menu-item";

export const MENU: AppMenuItem[] = [
  {
    label: 'Home',
    icon: 'pi pi-home',
    active: false,
    link: '/'
  },
  {
    label: 'Configurações',
    icon: 'pi pi-cog',
    active: false,
    link: '/configurations',
    permission: 'core.configurations'
  },
  {
    label: 'Segurança',
    icon: 'pi pi-lock',
    active: false,
    items: [
      {
        label: 'Usuários',
        icon: 'pi pi-users',
        active: false,
        link: '/security/users',
        permission: 'users.viewAny'
      },
      {
        label: 'Papéis',
        icon: 'pi pi-star',
        active: false,
        link: '/security/roles',
        permission: 'roles.viewAny'
      }
    ]
  }
];