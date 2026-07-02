import { describe, expect, it } from 'vitest';
import { FormControl } from '@angular/forms';
import { phoneValidator } from './phone.validator';

describe('phoneValidator', () => {
  const validator = phoneValidator();

  it('should return null if null or empty value', () => {
    const control = new FormControl<string | null>('');
    expect(validator(control)).toBeNull();

    control.setValue(null);
    expect(validator(control)).toBeNull();
  });

  it('should return null for valid cellphone number (DDD + "9" + 8 digits)', () => {
    const control = new FormControl<string | null>('11988887777');
    expect(validator(control)).toBeNull();
  });

  it('should return null for valid telephone (DDD + number between 2 and 8)', () => {
    const control = new FormControl<string | null>('1133334444');
    expect(validator(control)).toBeNull();
  });

  it('should return { phone: true } for numbers with invalid formats', () => {
    let control: FormControl<string | null>;

    control = new FormControl<string | null>('1198888');
    expect(control.value).toBeTruthy();
    expect(validator(control)).toEqual({ phone: true });

    control = new FormControl<string | null>('1198888aa77');
    expect(validator(control)).toEqual({ phone: true });

    control = new FormControl<string | null>('1112345678');
    expect(validator(control)).toEqual({ phone: true });

    control = new FormControl<string | null>('11588889999');
    expect(validator(control)).toEqual({ phone: true });

    control = new FormControl<string | null>('1198888999900');
    expect(validator(control)).toEqual({ phone: true });
  });
});