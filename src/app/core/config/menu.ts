import { AppMenuItem } from "../models/app-menu-item";

export const MENU: AppMenuItem[] = [
  {
    label: 'Home',
    icon: 'pi pi-home',
    link: '/',
    permission: 'home.viewAny'
  },
  {
    label: 'Parceiros',
    icon: 'pi pi-folder',
    items: [
      {
        label: 'Cadastros',
        icon: 'pi pi-users',
        link: '/partners',
        permission: 'partners.viewAny'
      },
      {
        label: 'Como nos conheceu',
        icon: 'pi pi-question',
        link: '/partners/how-know',
        permission: 'how-know.viewAny'
      }
    ]
  },
  {
    label: 'Configurações',
    icon: 'pi pi-cog',
    link: '/configurations',
    permission: 'core.configurations'
  },
  {
    label: 'Segurança',
    icon: 'pi pi-lock',
    items: [
      {
        label: 'Usuários',
        icon: 'pi pi-users',
        link: '/users',
        permission: 'users.viewAny'
      },
      {
        label: 'Papéis',
        icon: 'pi pi-star',
        link: '/roles',
        permission: 'roles.viewAny'
      }
    ]
  }
];