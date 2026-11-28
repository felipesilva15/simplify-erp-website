import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, merge, Subscription } from 'rxjs';

/**
 * Label de formulário que exibe o asterisco de obrigatório somente quando o
 * controle possui `Validators.required`.
 *
 * Mudanças de validators não emitem eventos próprios. Por isso, os eventos do
 * formulário e do controle são observados para marcar o componente para nova
 * verificação quando os validators são alterados dinamicamente.
 */
@Component({
  selector: 'app-form-label',
  template: `
    <label [for]="inputId() ?? control()">{{ label() }}@if (isRequired()) {<span class="text-red-500 font-bold" aria-hidden="true">*</span>}</label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLabelComponent implements OnDestroy {
  readonly label = input.required<string>();
  readonly form = input.required<FormGroup>();
  readonly control = input.required<string>();
  /** Permite associar o label a um id diferente do nome do controle. */
  readonly inputId = input<string>();

  private readonly changeDetector = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  constructor() {
    effect(() => {
      const form = this.form();
      const controlName = this.control();
      const control = form.get(controlName);

      this.subscription?.unsubscribe();
      this.subscription = merge(form.events, control?.events ?? EMPTY).subscribe(() => {
        this.changeDetector.markForCheck();
      });
    });
  }

  isRequired(): boolean {
    return this.getControl()?.hasValidator(Validators.required) ?? false;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private getControl(): AbstractControl | null {
    return this.form().get(this.control());
  }
}
