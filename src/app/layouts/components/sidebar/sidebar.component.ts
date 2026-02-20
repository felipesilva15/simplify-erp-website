import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { MenuService } from '../../../core/services/menu-service';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { JsonPipe, NgClass } from '@angular/common';
import { isActive, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [LogoComponent, ButtonModule, DividerModule, PanelMenuModule, NgClass, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  menu: MenuItem[] = [];

  constructor(private menuService: MenuService, private router: Router) {
    this.menu = menuService.getMenu();
  }

  ngOnInit(): void {
    this.menuService.updateMenuActivation(this.menu);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.menuService.updateMenuActivation(this.menu);
      });
  }
}
