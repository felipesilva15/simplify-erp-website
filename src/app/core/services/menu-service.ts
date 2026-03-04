import { RouteUtilsService } from './route-utils-service';
import { inject, Injectable } from '@angular/core';
import { PermissionService } from '../auth/services/permission-service';
import { MenuItem } from 'primeng/api';
import { MENU } from '../config/menu';
import { AppMenuItem } from '../models/app-menu-item';
import { isActive, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  constructor(private permissionService: PermissionService, private router: Router, private routeUtilsService: RouteUtilsService) {}

  getMenu(): MenuItem[] {
    return this.filterByPermission(MENU);
  }

  private filterByPermission(items: AppMenuItem[]): MenuItem[] {
    let menu = items
      .filter(item => this.isAllowed(item))
      .map(item => ({
        ...item,
        items: item.items
          ? this.filterByPermission(item.items as AppMenuItem[])
          : undefined
      }));

    menu = menu.filter(item => !item.items || (item.items && item.items.length > 0))

    return menu;
  }

  private isAllowed(item: AppMenuItem): boolean {
    if (!item.permission) 
      return true;

    if (Array.isArray(item.permission)) {
      return this.permissionService.hasAny(item.permission);
    }

    return this.permissionService.has(item.permission ?? '');
  }

  updateMenuActivation(menu: any[]): void {
    if (!menu || menu.length <= 0) {
      return;
    }

    for (let i = 0; i < menu.length; i++) {
      const item: any = menu[i];
      let hasActiveChild: boolean = false;

      if (item.items && item.items.length) {
        hasActiveChild = item.items.some((subItem: MenuItem) => subItem['link'] && this.routeUtilsService.isRouteActive(subItem['link']));
      }

      item.active = hasActiveChild || this.routeUtilsService.isRouteActive(item.link);
      item.expanded = hasActiveChild;

      this.updateMenuActivation(item.items);
    }
  }
}