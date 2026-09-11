import { Component } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { DrawerOutletDirective } from '../../directives/drawer-outlet.directive';
import { DynamicDrawerService } from '../../services/dynamic-drawer-service';
import { DrawerInstance } from '../../../core/models/drawer-instance';
import { Position } from '../../../core/enums/position';

type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

@Component({
  selector: 'app-drawer-host',
  imports: [DrawerModule, DrawerOutletDirective],
  templateUrl: './drawer-host.component.html',
  styleUrl: './drawer-host.component.scss',
})
export class DrawerHostComponent {
  constructor(public dynamicDrawerService: DynamicDrawerService) { }

  getPosition(item: DrawerInstance): DrawerPosition {
    switch (item.config.position) {
      case Position.Right:
        return 'right';
      case Position.Top:
        return 'top';
      case Position.Bottom:
        return 'bottom';
      default:
        return 'left';
    }
  }

  getStyle(item: DrawerInstance): Record<string, string> {
    const horizontal = item.config.position === Position.Top || item.config.position === Position.Bottom;
    return {
      zIndex: String(item.zIndex),
      ...(item.config.size ? { [horizontal ? 'height' : 'width']: item.config.size } : {}),
      ...(item.config.style ?? {}),
    };
  }
}