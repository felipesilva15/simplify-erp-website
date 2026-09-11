import { Injectable, signal, Type } from '@angular/core';
import { DrawerRef } from '../../core/lib/drawer-ref';
import { DrawerConfig } from '../../core/models/drawer-config';
import { DrawerInstance } from '../../core/models/drawer-instance';

/** Duração total da animação de saída: drawer (0.5s) + máscara (0.15s) + margem. */
const DRAWER_LEAVE_ANIMATION_MS = 800;

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
      level: level,
      visible: signal(true),
    }]);
    ref.onClose.subscribe(() => this.close(ref));
    return ref;
  }

  private close(ref: DrawerRef): void {
    const instance = this.stack().find(i => i.ref === ref);
    if (!instance) {
      return;
    }

    instance.visible.set(false);

    window.setTimeout(() => this.remove(ref), DRAWER_LEAVE_ANIMATION_MS);
  }

  private remove(ref: DrawerRef): void {
    this.stack.update(s => s.filter(i => i.ref !== ref));

    if (this.stack().length === 0) {
      document.querySelectorAll('.p-overlay-mask').forEach(el => el.remove());
    }
  }
}