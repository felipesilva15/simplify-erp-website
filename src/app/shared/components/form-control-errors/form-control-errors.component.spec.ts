import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';
import { FormControlErrorsComponent } from './form-control-errors.component';

describe('FormControlErrorsComponent', () => {
  let component: FormControlErrorsComponent;
  let fixture: ComponentFixture<FormControlErrorsComponent>;
  let control: FormControl;

  beforeEach(async () => {
    control = new FormControl(null);

    await TestBed.configureTestingModule({
      imports: [FormControlErrorsComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControlErrorsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', control);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── showErrors ────────────────────────────────────────────────────────────

  describe('showErrors', () => {
    it('should return false when controlState is null', () => {
      fixture.componentRef.setInput('control', null);
      fixture.detectChanges();

      expect(component.showErrors()).toBe(false);
    });

    it('should return false when control has no errors', () => {
      control.setValue('valid');

      expect(component.showErrors()).toBe(false);
    });

    it('should return false when control has errors but is not touched or dirty', () => {
      control.setValidators(() => ({ required: true }));
      control.updateValueAndValidity();

      expect(component.showErrors()).toBe(false);
    });

    it('should return true when control has errors and is touched', () => {
      control.setValidators(() => ({ required: true }));
      control.updateValueAndValidity();
      control.markAsTouched();

      expect(component.showErrors()).toBe(true);
    });

    it('should return true when control has errors and is dirty', () => {
      control.setValidators(() => ({ required: true }));
      control.updateValueAndValidity();
      control.markAsDirty();

      expect(component.showErrors()).toBe(true);
    });

    it('should return true when control has errors and is both touched and dirty', () => {
      control.setValidators(() => ({ required: true }));
      control.updateValueAndValidity();
      control.markAsTouched();
      control.markAsDirty();

      expect(component.showErrors()).toBe(true);
    });
  });

  // ─── errorMessages ─────────────────────────────────────────────────────────

  describe('errorMessages', () => {
    it('should return empty array when showErrors is false', () => {
      expect(component.errorMessages()).toEqual([]);
    });

    it('should return empty array when errors is null despite showErrors being true', () => {
      control.setValidators(() => null);
      control.updateValueAndValidity();
      control.markAsTouched();

      expect(component.errorMessages()).toEqual([]);
    });

    describe('required', () => {
      it('should return required message with default label', () => {
        control.setValidators(() => ({ required: true }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'required',
          message: 'Este campo é obrigatório(a).',
        });
      });

      it('should return required message with custom label', () => {
        fixture.componentRef.setInput('label', 'Nome');
        control.setValidators(() => ({ required: true }));
        control.updateValueAndValidity();
        control.markAsTouched();

        expect(component.errorMessages()[0].message).toBe('Nome é obrigatório(a).');
      });
    });

    describe('minlength', () => {
      it('should return minlength message with correct lengths', () => {
        control.setValidators(() => ({
          minlength: { requiredLength: 5, actualLength: 3 },
        }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'minlength',
          message: 'Este campo deve ter no mínimo 5 caracteres. Foram informados 3.',
        });
      });

      it('should return minlength message with custom label', () => {
        fixture.componentRef.setInput('label', 'Senha');
        control.setValidators(() => ({
          minlength: { requiredLength: 8, actualLength: 2 },
        }));
        control.updateValueAndValidity();
        control.markAsTouched();

        expect(component.errorMessages()[0].message).toBe(
          'Senha deve ter no mínimo 8 caracteres. Foram informados 2.'
        );
      });
    });

    describe('maxlength', () => {
      it('should return maxlength message with correct lengths', () => {
        control.setValidators(() => ({
          maxlength: { requiredLength: 10, actualLength: 15 },
        }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'maxlength',
          message: 'Este campo deve ter no máximo 10 caracteres. Foram informados 15.',
        });
      });

      it('should return maxlength message with custom label', () => {
        fixture.componentRef.setInput('label', 'Apelido');
        control.setValidators(() => ({
          maxlength: { requiredLength: 3, actualLength: 7 },
        }));
        control.updateValueAndValidity();
        control.markAsTouched();

        expect(component.errorMessages()[0].message).toBe(
          'Apelido deve ter no máximo 3 caracteres. Foram informados 7.'
        );
      });
    });

    describe('min', () => {
      it('should return min message', () => {
        control.setValidators(() => ({ min: { min: 18 } }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'min',
          message: 'Este campo deve ser no mínimo 18.',
        });
      });

      it('should return min message with custom label', () => {
        fixture.componentRef.setInput('label', 'Idade');
        control.setValidators(() => ({ min: { min: 0 } }));
        control.updateValueAndValidity();
        control.markAsTouched();

        expect(component.errorMessages()[0].message).toBe('Idade deve ser no mínimo 0.');
      });
    });

    describe('max', () => {
      it('should return max message', () => {
        control.setValidators(() => ({ max: { max: 100 } }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'max',
          message: 'Este campo deve ser no máximo 100.',
        });
      });

      it('should return max message with custom label', () => {
        fixture.componentRef.setInput('label', 'Percentual');
        control.setValidators(() => ({ max: { max: 50 } }));
        control.updateValueAndValidity();
        control.markAsTouched();

        expect(component.errorMessages()[0].message).toBe('Percentual deve ser no máximo 50.');
      });
    });

    describe('email', () => {
      it('should return email message', () => {
        control.setValidators(() => ({ email: true }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'email',
          message: 'Informe um e-mail válido.',
        });
      });
    });

    describe('phone', () => {
      it('should return phone message', () => {
        control.setValidators(() => ({ phone: true }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'phone',
          message: 'Informe um telefone válido.',
        });
      });
    });

    describe('pattern', () => {
      it('should return pattern message', () => {
        control.setValidators(() => ({ pattern: true }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'pattern',
          message: 'Este campo possui formato inválido.',
        });
      });

      it('should return pattern message with custom label', () => {
        fixture.componentRef.setInput('label', 'CEP');
        control.setValidators(() => ({ pattern: true }));
        control.updateValueAndValidity();
        control.markAsTouched();

        expect(component.errorMessages()[0].message).toBe('CEP possui formato inválido.');
      });
    });

    describe('cpf', () => {
      it('should return cpf message', () => {
        control.setValidators(() => ({ cpf: true }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'cpf',
          message: 'Informe um CPF válido.',
        });
      });
    });

    describe('cnpj', () => {
      it('should return cnpj message', () => {
        control.setValidators(() => ({ cnpj: true }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual({
          key: 'cnpj',
          message: 'Informe um CNPJ válido.',
        });
      });
    });

    describe('multiple errors', () => {
      it('should return all error messages when multiple errors exist', () => {
        control.setValidators(() => ({
          required: true,
          minlength: { requiredLength: 5, actualLength: 2 },
        }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(2);
        expect(messages[0].key).toBe('required');
        expect(messages[1].key).toBe('minlength');
      });

      it('should return messages for all supported error types at once', () => {
        control.setValidators(() => ({
          required: true,
          minlength: { requiredLength: 5, actualLength: 2 },
          maxlength: { requiredLength: 10, actualLength: 15 },
          min: { min: 0 },
          max: { max: 100 },
          email: true,
          phone: true,
          pattern: true,
          cpf: true,
          cnpj: true,
        }));
        control.updateValueAndValidity();
        control.markAsTouched();

        const messages = component.errorMessages();
        expect(messages.length).toBe(10);
        expect(messages.map(m => m.key)).toEqual([
          'required', 'minlength', 'maxlength', 'min', 'max',
          'email', 'phone', 'pattern', 'cpf', 'cnpj',
        ]);
      });
    });
  });

  // ─── Effect / subscription ────────────────────────────────────────────────

  describe('effect and subscription', () => {
    it('should update controlState when control value changes', () => {
      control.setValidators(() => ({ required: true }));
      control.updateValueAndValidity();
      control.markAsTouched();

      expect(component.showErrors()).toBe(true);

      control.clearValidators();
      control.updateValueAndValidity();

      expect(component.showErrors()).toBe(false);
    });

    it('should subscribe to control events', () => {
      control.setValidators(() => ({ required: true }));
      control.updateValueAndValidity();

      expect(component.showErrors()).toBe(false);

      control.markAsTouched();

      expect(component.showErrors()).toBe(true);
    });

    it('should unsubscribe from previous control when control input changes', async () => {
      const oldControl = control;
      const newControl = new FormControl(null);

      newControl.setValidators(() => ({ required: true }));
      newControl.updateValueAndValidity();
      newControl.markAsTouched();

      fixture.componentRef.setInput('control', newControl);
      await fixture.whenStable();

      expect(component.showErrors()).toBe(true);

      oldControl.markAsTouched();
      oldControl.updateValueAndValidity();
      await fixture.whenStable();

      expect(component.showErrors()).toBe(true);
    });

    it('should set controlState to null when control changes to null', () => {
      control.setValidators(() => ({ required: true }));
      control.updateValueAndValidity();
      control.markAsTouched();

      expect(component.showErrors()).toBe(true);

      fixture.componentRef.setInput('control', null);
      fixture.detectChanges();

      expect(component.showErrors()).toBe(false);
      expect(component.errorMessages()).toEqual([]);
    });
  });

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscription on destroy', () => {
      const unsubscribeSpy = vi.spyOn(
        component['subscription']!,
        'unsubscribe'
      );

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
    });

    it('should be safe to call ngOnDestroy when subscription is undefined', async () => {
      fixture.componentRef.setInput('control', null);
      await fixture.whenStable();

      component['subscription'] = undefined;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  // ─── label input ──────────────────────────────────────────────────────────

  describe('label input', () => {
    it('should have default label value', () => {
      expect(component.label()).toBe('Este campo');
    });

    it('should use custom label in error messages', () => {
      fixture.componentRef.setInput('label', 'Documento');
      control.setValidators(() => ({ required: true }));
      control.updateValueAndValidity();
      control.markAsTouched();

      expect(component.errorMessages()[0].message).toBe('Documento é obrigatório(a).');
    });
  });
});
