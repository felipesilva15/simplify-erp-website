import { AppMenuItem } from "../models/app-menu-item";

export const MENU: AppMenuItem[] = [
  {
    separator: true
  },
  {
    label: 'Home',
    icon: 'pi pi-home',
    active: false,
    link: '/'
  },
  {
    label: 'Parceiros',
    icon: 'pi pi-folder',
    active: false,
    items: [
      {
        label: 'Tipos de parceiro',
        icon: 'pi pi-star',
        active: false,
        link: '/partner/partner-types',
        permission: 'partnerTypes.viewAny'
      }
    ]
  },
  {
    label: 'Catálogo',
    icon: 'pi pi-tag',
    active: false,
    items: [
      {
        label: 'Produtos',
        icon: 'pi pi-barcode',
        active: false,
        link: '/catalog/products',
        permission: 'products.viewAny'
      }
    ]
  },
  {
    separator: true
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
        label: 'Perfis',
        icon: 'pi pi-star',
        active: false,
        link: '/security/roles',
        permission: 'roles.viewAny'
      }
    ]
  },
  {
    separator: true
  }
];