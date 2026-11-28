import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DecimalControl } from '../../forms/decimal-control';
import { FormLabelComponent } from './form-label.component';

describe('FormLabelComponent', () => {
  let fixture: ComponentFixture<FormLabelComponent>;

  function createFixture(form: FormGroup, control: string, inputId?: string): void {
    TestBed.configureTestingModule({ imports: [FormLabelComponent] });
    fixture = TestBed.createComponent(FormLabelComponent);
    fixture.componentRef.setInput('label', 'Nome');
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('control', control);
    if (inputId) {
      fixture.componentRef.setInput('inputId', inputId);
    }
    fixture.detectChanges();
  }

  function label(): HTMLLabelElement {
    return fixture.nativeElement.querySelector('label') as HTMLLabelElement;
  }

  function asterisk(): HTMLSpanElement | null {
    return fixture.nativeElement.querySelector('span');
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('associa o label ao nome do controle', () => {
    createFixture(new FormGroup({ name: new FormControl('') }), 'name');

    expect(label().getAttribute('for')).toBe('name');
    expect(label().textContent).toBe('Nome');
  });

  it('associa o label ao inputId informado', () => {
    createFixture(new FormGroup({ type: new FormControl('') }), 'type', 'address_type');

    expect(label().getAttribute('for')).toBe('address_type');
  });

  it('exibe asterisco com aria-hidden quando o controle possui Validators.required', () => {
    createFixture(new FormGroup({ name: new FormControl('', [Validators.required]) }), 'name');

    expect(label().textContent).toBe('Nome*');
    expect(asterisk()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('não exibe asterisco quando o controle não possui Validators.required', () => {
    createFixture(new FormGroup({ name: new FormControl('', [Validators.minLength(3)]) }), 'name');

    expect(label().textContent).toBe('Nome');
    expect(asterisk()).toBeNull();
  });

  it('não exibe asterisco quando o controle não existe', () => {
    createFixture(new FormGroup({ name: new FormControl('') }), 'unknown');

    expect(label().textContent).toBe('Nome');
    expect(asterisk()).toBeNull();
  });

  it('adiciona o asterisco quando required é adicionado dinamicamente', () => {
    const form = new FormGroup({ name: new FormControl('Preenchido') });
    createFixture(form, 'name');

    form.controls.name.addValidators(Validators.required);
    form.controls.name.updateValueAndValidity();
    fixture.detectChanges();

    expect(label().textContent).toBe('Nome*');
  });

  it('remove o asterisco quando required é removido dinamicamente', () => {
    const form = new FormGroup({ name: new FormControl('Preenchido', [Validators.required]) });
    createFixture(form, 'name');

    form.controls.name.removeValidators(Validators.required);
    form.controls.name.updateValueAndValidity();
    fixture.detectChanges();

    expect(label().textContent).toBe('Nome');
  });

  it('atualiza o asterisco quando validators mudam com emitEvent false, mas o formulário emite evento', () => {
    const form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      country: new FormControl('BR'),
    });
    createFixture(form, 'name');

    form.controls.name.removeValidators(Validators.required);
    form.controls.name.updateValueAndValidity({ emitEvent: false });
    form.controls.country.setValue('US');
    fixture.detectChanges();

    expect(label().textContent).toBe('Nome');
  });

  it('funciona com DecimalControl', () => {
    const control = new DecimalControl(2, null, [Validators.required]);
    createFixture(new FormGroup({ price: control }), 'price');

    expect(control.scale).toBe(2);
    expect(label().textContent).toBe('Nome*');

    control.removeValidators(Validators.required);
    control.updateValueAndValidity();
    fixture.detectChanges();

    expect(label().textContent).toBe('Nome');
  });
});
