import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../../core/services/menu-service';
import { MenuItem } from 'primeng/api';
import { PanelMenu } from 'primeng/panelmenu';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [LogoComponent, ButtonModule, DividerModule, PanelMenu, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  menu: MenuItem[] = [];

  constructor(private menuService: MenuService) {
    this.menu = menuService.getMenu();
    console.log(this.menu)
  }

  ngOnInit(): void {
  }
}
