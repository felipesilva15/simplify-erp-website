import { Injectable } from '@angular/core';
import { PermissionService } from '../auth/services/permission-service';
import { MenuItem } from 'primeng/api';
import { MENU } from '../config/menu';
import { AppMenuItem } from '../models/app-menu-item';

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  constructor(private permission: PermissionService) {}

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

    menu = menu.filter(item => item.permission || (item.items && item.items.length > 0))

    return menu;
  }

  private isAllowed(item: AppMenuItem): boolean {
    if (!item.permission) 
      return true;

    if (Array.isArray(item.permission)) {
      return this.permission.hasAny(item.permission);
    }

    return this.permission.has(item.permission ?? '');
  }
}