import { Injectable, signal, Type } from '@angular/core';
import { DrawerRef } from '../../core/lib/drawer-ref';
import { DrawerConfig } from '../../core/models/drawer-config';
import { DrawerInstance } from '../../core/models/drawer-instance';

@Injectable({
  providedIn: 'root',
})
export class DynamicDrawerService {
  private stack = signal<DrawerInstance[]>([]);
  drawers = this.stack.asReadonly();

  open<T>(component: Type<T>, config: DrawerConfig = {}): DrawerRef {
    const ref = new DrawerRef();
    const level = this.stack().length;
    this.stack.update(s => [...s, {
      component, config, ref,
      zIndex: (config.baseZIndex ?? 20000) + level * 10,
      level: level
    }]);
    ref.onClose.subscribe(() => this.remove(ref));
    return ref;
  }

  private remove(ref: DrawerRef): void {
    this.stack.update(s => s.filter(i => i.ref !== ref));
  }
}
