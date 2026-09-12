import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogoType } from '../../../shared/enums/logo-type';

@Component({
  selector: 'app-sidebar-content',
  imports: [LogoComponent, ButtonModule, DividerModule, PanelMenuModule, NgClass, RouterLink],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss',
})
export class SidebarContentComponent {
  @Input({ required: true }) menu: MenuItem[] = [];
  @Input() logoType: LogoType = LogoType.Extended;
  @Input() buttonIcon = 'dock_to_right';
  @Input() expanded = true;
  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}