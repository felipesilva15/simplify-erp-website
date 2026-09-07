import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogConfig } from '../../../core/models/dynamic-dialog-config';
import { DialogRoute } from '../../../core/models/dialog-route';
import { DynamicDialogService } from '../../services/dynamic-dialog-service';

/**
 * Componente "host" a ser usado como `component` de uma rota de dialog.
 *
 * Uso (em um arquivo *.routes.ts), como child da rota da página que deve
 * permanecer visível atrás do dialog:
 * ```ts
 * {
 *   path: '',
 *   component: MyListPage,                      // permanece montado atrás do dialog
 *   children: [
 *     {
 *       path: 'importar',
 *       data: {
 *         dialog: {
 *           component: ImportDialogComponent,
 *           config: { title: 'Importar', size: DialogSize.Medium },
 *         },
 *       },
 *       component: DynamicDialogHostComponent,
 *     },
 *   ],
 * }
 * ```
 *
 * Ao navegar para a rota, o dialog é aberto automaticamente via DynamicDialogService.
 * Os `params` da rota (ex.: `:id`) são mesclados em `config.data`.
 *
 * Ciclo de vida:
 * - Quando o dialog fecha por conta própria (X / closable / Escape), navega de volta
 *   ao `backPath` (padrão: rota pai do dialog, ex.: a listagem que permaneceu atrás).
 * - Quando a rota é abandonada (ex.: "Voltar" via `facade.navigateBack` → `location.back()`,
 *   navegação externa), o host é destruído e fecha o dialog, sem navegar novamente.
 */
@Component({
  selector: 'app-dynamic-dialog-host',
  template: ``,
})
export class DynamicDialogHostComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(DynamicDialogService);
  private readonly destroyRef = inject(DestroyRef);

  private config!: DialogRoute;
  private destroyed = false;
  private closed = false;

  ngOnInit(): void {
    const dialog = this.route.snapshot.data['dialog'] as DialogRoute | undefined;

    if (!dialog?.component) {
      void this.navigateBack(dialog);
      return;
    }

    this.config = dialog;
    this.destroyRef.onDestroy(() => this.onDestroyed());

    void this.service
      .open(dialog.component, this.resolveConfig(dialog))
      .then(() => this.onClosed())
      .catch(() => this.onClosed());
  }

  /** Fecha o dialog quando o host é destruído (rota abandonada). */
  private onDestroyed(): void {
    this.destroyed = true;

    if (!this.closed) {
      this.service.close();
    }
  }

  /** Navega de volta apenas se o dialog foi fechado ainda na rota do dialog. */
  private onClosed(): void {
    if (this.closed || this.destroyed) {
      return;
    }

    this.closed = true;
    void this.navigateBack(this.config);
  }

  private resolveConfig(dialog: DialogRoute): DynamicDialogConfig {
    const params = this.route.snapshot.params ?? {};
    return {
      ...(dialog.config ?? {}),
      data: { ...(dialog.config?.data ?? {}), ...params },
    };
  }

  private async navigateBack(dialog: DialogRoute | undefined): Promise<void> {
    if (dialog?.backPath) {
      const backPath = dialog.backPath;
      await this.router.navigate(Array.isArray(backPath) ? backPath : [backPath], {
        relativeTo: this.route,
      });
      return;
    }

    await this.router.navigateByUrl(this.parentUrl());
  }

  /**
   * URL da rota pai (ex.: a listagem que permanece montada atrás do dialog).
   *
   * Baseia-se na árvore de rotas (não em `'..'` sobre a URL), para que o retorno
   * seja sempre a rota anterior mesmo quando a rota de dialog tem mais de um
   * segmento (ex.: `:id/edit` voltando para a listagem, não para `:id`).
   */
  private parentUrl(): string {
    const parentSnapshot = this.route.parent?.snapshot;

    if (!parentSnapshot) {
      return '/';
    }

    const segments = parentSnapshot.pathFromRoot
      .flatMap((route) => route.url.map((segment) => segment.path))
      .filter((path) => path.length > 0);

    return '/' + segments.join('/');
  }
}