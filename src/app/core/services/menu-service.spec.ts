import { TestBed } from '@angular/core/testing';
import { MenuService } from './menu-service';
import { PermissionService } from '../auth/services/permission-service';
import { RouteUtilsService } from './route-utils-service';
import { Router } from '@angular/router';
import { AppMenuItem } from '../models/app-menu-item';

describe('MenuService', () => {
  let service: MenuService;
  let permissionService: { has: (p: string) => boolean; hasAny: (p: string[]) => boolean };
  let routeUtilsService: { isRouteActive: (url: string) => boolean };
  let router: { url: string };

  beforeEach(() => {
    permissionService = { has: () => false, hasAny: () => false };
    routeUtilsService = { isRouteActive: () => false };
    router = { url: '/' };

    TestBed.configureTestingModule({
      providers: [
        MenuService,
        { provide: PermissionService, useValue: permissionService },
        { provide: RouteUtilsService, useValue: routeUtilsService },
        { provide: Router, useValue: router },
      ],
    });
    service = TestBed.inject(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMenu', () => {
    it('should include items without permission', () => {
      permissionService.has = () => false;
      permissionService.hasAny = () => false;
      const menu = service.getMenu();
      const labels = menu.map((m: any) => m.label);
      expect(labels).toContain('Home');
    });

    it('should include items with matching single permission', () => {
      permissionService.has = (p: string) => p === 'core.configurations';
      const menu = service.getMenu();
      const labels = menu.map((m: any) => m.label);
      expect(labels).toContain('Configurações');
    });

    it('should exclude items with non-matching single permission', () => {
      permissionService.has = () => false;
      const menu = service.getMenu();
      const labels = menu.map((m: any) => m.label);
      expect(labels).not.toContain('Configurações');
    });

    it('should include children with matching permission (has)', () => {
      permissionService.has = (p: string) => p === 'users.viewAny';
      const menu = service.getMenu();
      const security = menu.find((m: any) => m.label === 'Segurança');
      expect(security).toBeTruthy();
      expect(security!.items!.length).toBe(1);
      expect(security!.items![0].label).toBe('Usuários');
    });

    it('should filter out children with no matching permissions', () => {
      permissionService.has = (p: string) => p === 'core.configurations';
      const menu = service.getMenu();
      const security = menu.find((m: any) => m.label === 'Segurança');
      expect(security).toBeUndefined();
    });

    it('should exclude parent group if all children are filtered out', () => {
      permissionService.has = () => false;
      permissionService.hasAny = () => false;
      const menu = service.getMenu();
      const security = menu.find((m: any) => m.label === 'Segurança');
      expect(security).toBeUndefined();
    });

    it('should not have items property when item has no nested items', () => {
      permissionService.has = (p: string) => p === 'core.configurations';
      const menu = service.getMenu();
      const home = menu.find((m: any) => m.label === 'Home');
      expect(home).toBeTruthy();
      expect(home!.items).toBeUndefined();
    });

    it('should include items with empty permission string as allowed', () => {
      const testMenu: AppMenuItem[] = [
        { label: 'TestItem', link: '/test', permission: '' },
      ];
      const result = (service as any).filterByPermission(testMenu);
      expect(result.length).toBe(1);
      expect(result[0].label).toBe('TestItem');
    });

    it('should use hasAny when permission is an array', () => {
      permissionService.hasAny = (perms: string[]) => perms.includes('edit.access');
      permissionService.has = () => false;
      const testMenu: AppMenuItem[] = [
        { label: 'ArrayPerm', link: '/arr', permission: ['edit.access', 'view.access'] },
        { label: 'NoArrayPerm', link: '/noarr', permission: ['other.perm'] },
      ];
      const result = (service as any).filterByPermission(testMenu);
      expect(result.length).toBe(1);
      expect(result[0].label).toBe('ArrayPerm');
    });

    it('should remove parent when all children with array permissions are filtered out', () => {
      permissionService.hasAny = () => false;
      permissionService.has = () => false;
      const testMenu: AppMenuItem[] = [
        {
          label: 'Parent',
          items: [
            { label: 'Child1', permission: ['a.b'] },
            { label: 'Child2', permission: ['c.d'] },
          ],
        },
      ];
      const result = (service as any).filterByPermission(testMenu);
      expect(result.length).toBe(0);
    });

    it('should keep parent when some children with array permissions pass', () => {
      permissionService.hasAny = (perms: string[]) => perms.includes('a.b');
      permissionService.has = () => false;
      const testMenu: AppMenuItem[] = [
        {
          label: 'Parent',
          items: [
            { label: 'Child1', permission: ['a.b'] },
            { label: 'Child2', permission: ['c.d'] },
          ],
        },
      ];
      const result = (service as any).filterByPermission(testMenu);
      expect(result.length).toBe(1);
      expect(result[0].items.length).toBe(1);
      expect(result[0].items[0].label).toBe('Child1');
    });
  });

  describe('updateMenuActivation', () => {
    it('should return early for null menu', () => {
      service.updateMenuActivation(null as any);
      expect(service.updateMenuActivation).toHaveBeenCalledTimes(1);
    });

    it('should return early for empty menu', () => {
      service.updateMenuActivation([]);
      expect(service.updateMenuActivation).toHaveBeenCalledTimes(1);
    });

    it('should set active to true when route matches item link', () => {
      routeUtilsService.isRouteActive = (url: string) => url === '/dashboard';
      const menu = [{ link: '/dashboard', active: false, expanded: false }];
      service.updateMenuActivation(menu);
      expect(menu[0].active).toBe(true);
      expect(menu[0].expanded).toBe(false);
    });

    it('should set active to false when route does not match', () => {
      routeUtilsService.isRouteActive = () => false;
      const menu = [{ link: '/other', active: false, expanded: false }];
      service.updateMenuActivation(menu);
      expect(menu[0].active).toBe(false);
      expect(menu[0].expanded).toBe(false);
    });

    it('should set active and expanded when a child route is active', () => {
      routeUtilsService.isRouteActive = (url: string) => url === '/security/users';
      const menu = [{
        link: '/security',
        active: false,
        expanded: false,
        items: [
          { link: '/security/users', label: 'Users' },
          { link: '/security/roles', label: 'Roles' },
        ],
      }];
      service.updateMenuActivation(menu);
      expect(menu[0].active).toBe(true);
      expect(menu[0].expanded).toBe(true);
    });

    it('should set expanded to false when no child route is active', () => {
      routeUtilsService.isRouteActive = () => false;
      const menu = [{
        link: '/security',
        active: false,
        expanded: false,
        items: [
          { link: '/security/users', label: 'Users' },
        ],
      }];
      service.updateMenuActivation(menu);
      expect(menu[0].expanded).toBe(false);
    });

    it('should handle items without items property', () => {
      routeUtilsService.isRouteActive = (url: string) => url === '/';
      const menu = [{ link: '/', active: false, expanded: false }];
      service.updateMenuActivation(menu);
      expect(menu[0].active).toBe(true);
      expect(menu[0].expanded).toBe(false);
    });

    it('should handle items with empty items array', () => {
      routeUtilsService.isRouteActive = (url: string) => url === '/page';
      const menu = [{
        link: '/page',
        active: false,
        expanded: false,
        items: [],
      }];
      service.updateMenuActivation(menu);
      expect(menu[0].active).toBe(true);
      expect(menu[0].expanded).toBe(false);
    });

    it('should handle deeply nested menu items', () => {
      routeUtilsService.isRouteActive = (url: string) => url === '/a/b';
      const menu = [{
        link: '/a',
        active: false,
        expanded: false,
        items: [{
          link: '/a/b',
          active: false,
          expanded: false,
          items: [
            { link: '/a/b/c', label: 'Deep' },
          ],
        }],
      }];
      service.updateMenuActivation(menu);
      expect(menu[0].expanded).toBe(true);
      expect(menu[0].items[0].expanded).toBe(false);
      expect(menu[0].items[0].active).toBe(true);
    });

    it('should not set active when child has link but route is not active', () => {
      routeUtilsService.isRouteActive = () => false;
      const menu = [{
        link: '/parent',
        active: false,
        expanded: false,
        items: [
          { link: '/child', label: 'Child' },
        ],
      }];
      service.updateMenuActivation(menu);
      expect(menu[0].active).toBe(false);
      expect(menu[0].expanded).toBe(false);
    });

    it('should handle subItem without link property', () => {
      routeUtilsService.isRouteActive = (url: string) => url === '/parent';
      const menu = [{
        link: '/parent',
        active: false,
        expanded: false,
        items: [
          { label: 'NoLink' },
        ],
      }];
      service.updateMenuActivation(menu);
      expect(menu[0].active).toBe(true);
      expect(menu[0].expanded).toBe(false);
    });
  });
});
