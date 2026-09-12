import { LogoType } from './../../../shared/enums/logo-type';
import { Component, computed, HostListener, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { MenuService } from '../../../core/services/menu-service';
import { MenuItem } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DynamicDrawerService } from '../../../shared/services/dynamic-drawer-service';
import { SidebarDrawerContentComponent } from '../sidebar-drawer-content/sidebar-drawer-content.component';
import { Position } from '../../../core/enums/position';
import { SidebarContentComponent } from '../sidebar-content/sidebar-content.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarContentComponent, ButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  menu: MenuItem[] = [];
  logoType: Signal<LogoType> = computed(() => this.isMobileScreen() ? LogoType.Mini : LogoType.Extended);
  isExpanded: WritableSignal<boolean> = signal<boolean>(true);
  windowWidth: WritableSignal<number> = signal<number>(window.innerWidth)
  isMobileScreen: Signal<boolean> = computed(() => this.windowWidth() <= 992);
  showSidebar: Signal<boolean> = computed(() => this.isMobileScreen() ? false : this.isExpanded());

  constructor(
    private menuService: MenuService,
    private router: Router,
    private dynamicDrawerService: DynamicDrawerService,
  ) {
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

  @HostListener('window:resize')
  onWindowResize(): void {
    this.windowWidth.set(window.innerWidth);
  }

  toggle(): void {
    this.isExpanded.update(expanded => !expanded);
  }

  openDrawer(): void {
    this.dynamicDrawerService.open(SidebarDrawerContentComponent, {
      position: Position.Left,
      size: '18rem',
      styleClass: 'sidebar-drawer',
      modal: true,
      dismissible: true,
      closeOnEscape: true,
      showCloseIcon: false,
    });
  }
}