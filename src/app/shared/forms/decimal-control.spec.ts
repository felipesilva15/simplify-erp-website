import { describe, expect, it } from 'vitest';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DecimalControl, serializeDecimals, toDecimal } from './decimal-control';

describe('DecimalControl & Decimal Serialization', () => {
  describe('toDecimal', () => {
    it('should format number with configured decimal scale (e.g. 1499.59 -> "1499.5900")', () => {
      expect(toDecimal(1499.59, 4)).toBe('1499.5900');
      expect(toDecimal(1499.59, 2)).toBe('1499.59');
      expect(toDecimal(1499.59, 3)).toBe('1499.590');
    });

    it('should format zero correctly', () => {
      expect(toDecimal(0, 2)).toBe('0.00');
      expect(toDecimal(0, 4)).toBe('0.0000');
    });

    it('should format negative numbers correctly', () => {
      expect(toDecimal(-12.34, 2)).toBe('-12.34');
      expect(toDecimal(-12.34, 4)).toBe('-12.3400');
    });

    it('should format string representations of numbers', () => {
      expect(toDecimal('1499.59', 4)).toBe('1499.5900');
      expect(toDecimal('1499,59', 4)).toBe('1499.5900');
      expect(toDecimal('1.499,59', 4)).toBe('1499.5900');
      expect(toDecimal('1,499.59', 4)).toBe('1499.5900');
    });

    it('should return null for empty, null, undefined or non-finite values', () => {
      expect(toDecimal(null, 2)).toBeNull();
      expect(toDecimal(undefined, 2)).toBeNull();
      expect(toDecimal('', 2)).toBeNull();
      expect(toDecimal('   ', 2)).toBeNull();
      expect(toDecimal(NaN, 2)).toBeNull();
      expect(toDecimal(Infinity, 2)).toBeNull();
    });

    it('should return non-number unparseable strings as is', () => {
      expect(toDecimal('invalid-string', 2)).toBe('invalid-string');
    });

    it('should clamp scale to non-negative integers', () => {
      expect(toDecimal(12.345, 0)).toBe('12');
      expect(toDecimal(12.345, -2)).toBe('12');
    });
  });

  describe('serializeDecimals', () => {
    it('should serialize DecimalControl in a simple FormGroup from number to string', () => {
      const form = new FormGroup({
        name: new FormControl('Produto Teste'),
        price: new DecimalControl(2, 1499.59),
        cost: new DecimalControl(4, 1499.59),
        net_weight: new DecimalControl(3, null),
      });

      const raw = form.getRawValue();
      const result = serializeDecimals(form, raw);

      expect(result).toEqual({
        name: 'Produto Teste',
        price: '1499.59',
        cost: '1499.5900',
        net_weight: null,
      });
    });

    it('should serialize nested FormGroup controls', () => {
      const form = new FormGroup({
        financial: new FormGroup({
          price: new DecimalControl(4, 1499.59),
        }),
      });

      const raw = form.getRawValue();
      const result = serializeDecimals(form, raw);

      expect(result).toEqual({
        financial: {
          price: '1499.5900',
        },
      });
    });

    it('should serialize FormArray with FormGroups containing DecimalControl', () => {
      const form = new FormGroup({
        items: new FormArray([
          new FormGroup({
            amount: new DecimalControl(2, 10.5),
          }),
          new FormGroup({
            amount: new DecimalControl(4, 25.1),
          }),
        ]),
      });

      const raw = form.getRawValue();
      const result = serializeDecimals(form, raw);

      expect(result).toEqual({
        items: [
          { amount: '10.50' },
          { amount: '25.1000' },
        ],
      });
    });

    it('should leave non-DecimalControl controls unchanged', () => {
      const form = new FormGroup({
        age: new FormControl(25),
        active: new FormControl(true),
        description: new FormControl('desc'),
      });

      const raw = form.getRawValue();
      const result = serializeDecimals(form, raw);

      expect(result).toEqual(raw);
    });

    it('should return value unchanged if control is null or undefined', () => {
      expect(serializeDecimals(null, { test: 123 })).toEqual({ test: 123 });
      expect(serializeDecimals(undefined, { test: 123 })).toEqual({ test: 123 });
    });
  });
});
