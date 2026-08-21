import { Component } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { DynamicDrawerService } from '../../services/dynamic-drawer-service';

@Component({
  selector: 'app-drawer-host',
  imports: [DrawerModule],
  templateUrl: './drawer-host.component.html',
  styleUrl: './drawer-host.component.scss',
})
export class DrawerHostComponent {
  constructor(public dynamicDrawerService: DynamicDrawerService) { }
}
