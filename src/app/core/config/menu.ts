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
    label: 'Geografia',
    icon: 'pi pi-map-marker',
    active: false,
    items: [
      {
        label: 'Países',
        icon: 'pi pi-flag',
        active: false,
        link: '/geography/countries',
        permission: 'countries.viewAny'
      },
      {
        label: 'Estados',
        icon: 'pi pi-map',
        active: false,
        link: '/geography/states',
        permission: 'states.viewAny'
      },
      {
        label: 'Cidades',
        icon: 'pi pi-building',
        active: false,
        link: '/geography/cities',
        permission: 'cities.viewAny'
      }
    ]
  },
  {
    label: 'Terceiro',
    icon: 'pi pi-folder',
    active: false,
    items: [
      {
        label: 'Parceiros',
        icon: 'pi pi-user',
        active: false,
        link: '/third-party/partners',
        permission: 'partners.viewAny'
      },
      {
        label: 'Tipos de parceiro',
        icon: 'pi pi-star',
        active: false,
        link: '/third-party/partner-types',
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
    label: 'RH',
    icon: 'pi pi-id-card',
    active: false,
    items: [
      {
        label: 'Profissões',
        icon: 'pi pi-briefcase',
        active: false,
        link: '/hr/professions',
        permission: 'professions.viewAny'
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