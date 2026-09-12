import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { MenuService } from '../../../core/services/menu-service';
import { DRAWER_REF } from '../../../core/models/drawer-tokens';
import { SidebarContentComponent } from '../sidebar-content/sidebar-content.component';
import { LogoType } from '../../../shared/enums/logo-type';

@Component({
  selector: 'app-sidebar-drawer-content',
  imports: [SidebarContentComponent],
  templateUrl: './sidebar-drawer-content.component.html',
  styleUrl: './sidebar-drawer-content.component.scss',
})
export class SidebarDrawerContentComponent implements OnInit, OnDestroy {
  LogoType = LogoType;
  menu: MenuItem[] = [];

  private drawerRef = inject(DRAWER_REF, { optional: true });
  private destroy$ = new Subject<void>();

  constructor(
    private menuService: MenuService,
    private router: Router,
  ) {
    this.menu = menuService.getMenu();
  }

  ngOnInit(): void {
    this.menuService.updateMenuActivation(this.menu);
    this.watchNavigation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.drawerRef?.close();
  }

  private watchNavigation(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.menuService.updateMenuActivation(this.menu);
        this.drawerRef?.close();
      });
  }
}