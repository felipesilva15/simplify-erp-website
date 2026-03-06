import { LogoType } from './../../../shared/enums/logo-type';
import { Component, computed, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { MenuService } from '../../../core/services/menu-service';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [LogoComponent, ButtonModule, DividerModule, PanelMenuModule, NgClass, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  menu: MenuItem[] = [];
  logoType: Signal<LogoType> = computed(() => this.isMobileScreen() ? LogoType.Mini : LogoType.Extended);
  isExpanded: WritableSignal<boolean> = signal<boolean>(true);
  windowWidth: WritableSignal<number> = signal<number>(window.innerWidth)
  isMobileScreen: Signal<boolean> = computed(() => this.windowWidth() <= 576);
  showSidebar: Signal<boolean> = computed(() => this.isMobileScreen() ? false : this.isExpanded());

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

  toggle(): void {
    this.isExpanded.update(expanded => !expanded);
  }
}
