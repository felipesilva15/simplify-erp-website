import { CommonModule, JsonPipe } from '@angular/common';
import { Component, computed, effect, input, InputSignal, OnDestroy, signal, Signal } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-control-errors',
  imports: [
    CommonModule,
    MessageModule
  ],
  templateUrl: './form-control-errors.component.html',
  styleUrl: './form-control-errors.component.scss',
})
export class FormControlErrorsComponent implements OnDestroy {
  control = input.required<AbstractControl | null>();
  label = input<string>('Este campo');

  private controlState = signal<{ errors: ValidationErrors | null; touched: boolean; dirty: boolean } | null>(null);

  private subscription?: Subscription;

  constructor() {
    effect(() => {
      const ctrl = this.control();

      this.subscription?.unsubscribe();

      if (!ctrl) {
        this.controlState.set(null);
        return;
      }

      this.updateState(ctrl);

      this.subscription = ctrl.events.subscribe(() => {
        this.updateState(ctrl);
      });
    });
  }

  private updateState(ctrl: AbstractControl): void {
    this.controlState.set({
      errors: ctrl.errors,
      touched: ctrl.touched,
      dirty: ctrl.dirty,
    });
  }

  showErrors = computed<boolean>(() => {
    const state = this.controlState();
    if (!state) return false;
    return !!state.errors && (state.dirty || state.touched);
  });

  errorMessages = computed<{ key: string; message: string }[]>(() => {
    if (!this.showErrors()) 
      return [];

    const errors = this.controlState()?.errors;
    const label = this.label();

    if (!errors) 
      return [];

    const messages: { key: string; message: string }[] = [];

    if (errors['required']) {
      messages.push({ key: 'required', message: `${label} é obrigatório(a).` });
    }

    if (errors['minlength']) {
      const { requiredLength, actualLength } = errors['minlength'];
      messages.push({ key: 'minlength', message: `${label} deve ter no mínimo ${requiredLength} caracteres. Foram informados ${actualLength}.` });
    }

    if (errors['maxlength']) {
      const { requiredLength, actualLength } = errors['maxlength'];
      messages.push({ key: 'maxlength', message: `${label} deve ter no máximo ${requiredLength} caracteres. Foram informados ${actualLength}.` });
    }

    if (errors['min']) {
      messages.push({ key: 'min', message: `${label} deve ser no mínimo ${errors['min'].min}.` });
    }

    if (errors['max']) {
      messages.push({ key: 'max', message: `${label} deve ser no máximo ${errors['max'].max}.` });
    }

    if (errors['email']) {
      messages.push({ key: 'email', message: `Informe um e-mail válido.` });
    }

    if (errors['phone']) {
      messages.push({ key: 'phone', message: `Informe um telefone válido.` });
    }

    if (errors['pattern']) {
      messages.push({ key: 'pattern', message: `${label} possui formato inválido.` });
    }

    if (errors['cpf']) {
      messages.push({ key: 'cpf', message: `Informe um CPF válido.` });
    }

    if (errors['cnpj']) {
      messages.push({ key: 'cnpj', message: `Informe um CNPJ válido.` });
    }

    if (errors['server']) {
      messages.push({ key: 'server', message: errors['server'] });
    }

    return messages;
  });

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
