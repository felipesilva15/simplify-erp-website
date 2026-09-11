import {
  ComponentRef,
  Directive,
  EnvironmentInjector,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  createComponent,
  inject,
} from '@angular/core';
import { DrawerInstance } from '../../core/models/drawer-instance';
import { DRAWER_CONFIG, DRAWER_REF } from '../../core/models/drawer-tokens';

/**
 * Diretiva estrutural que instancia dinamicamente o componente do drawer dentro
 * do `p-drawer`, análoga ao renderer usado pelo DynamicDialog.
 *
 * Uso:
 * ```html
 * <ng-container *drawerOutlet="item" />
 * ```
 *
 * O componente alvo recebe via injeção:
 * - `DRAWER_REF`   → `DrawerRef` para fechar/comunicar;
 * - `DRAWER_CONFIG`→ config completa (incluindo `data`) do `open()`.
 */
@Directive({
  selector: '[drawerOutlet]',
})
export class DrawerOutletDirective implements OnInit, OnDestroy {
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);

  /** Instância do drawer a ser renderizada (produzida pelo DynamicDrawerService). */
  @Input() drawerOutlet!: DrawerInstance;

  private componentRef: ComponentRef<unknown> | null = null;

  ngOnInit(): void {
    this.render();
  }

  ngOnDestroy(): void {
    this.componentRef?.destroy();
    this.componentRef = null;
  }

  private render(): void {
    this.viewContainerRef.clear();
    this.componentRef = null;

    if (!this.drawerOutlet) {
      return;
    }

    const childInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DRAWER_REF, useValue: this.drawerOutlet.ref },
        { provide: DRAWER_CONFIG, useValue: this.drawerOutlet.config },
      ],
    });

    this.componentRef = createComponent(this.drawerOutlet.component, {
      environmentInjector: this.environmentInjector,
      elementInjector: childInjector,
    });

    this.viewContainerRef.insert(this.componentRef.hostView);
    this.componentRef.changeDetectorRef.detectChanges();
  }
}
