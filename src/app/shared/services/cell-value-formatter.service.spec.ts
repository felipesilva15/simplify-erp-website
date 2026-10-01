import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';

import { CellValueFormatterService } from './cell-value-formatter.service';
import { ColumnType } from '../../core/enums/column-type';

registerLocaleData(localePt, 'pt-BR');

describe('CellValueFormatterService', () => {
  let service: CellValueFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    });

    service = TestBed.inject(CellValueFormatterService);
  });

  it('should return an empty string for a nullish record', () => {
    expect(service.format(null, { field: 'name' })).toBe('');
  });

  it('should return an empty string when the field is absent', () => {
    expect(service.format({}, { field: 'name' })).toBe('');
  });

  it('should format plain text values', () => {
    expect(service.format({ name: 'Ana' }, { field: 'name', type: ColumnType.Text })).toBe('Ana');
  });

  it('should format dates', () => {
    const value = service.format({ partner_since: '2020-01-15' }, { field: 'partner_since', type: ColumnType.Date });

    expect(value).not.toBe('');
    expect(value).toContain('2020');
  });

  it('should fall back to the raw value for types without a dedicated formatter', () => {
    expect(service.format({ amount: 1234.5 }, { field: 'amount', type: ColumnType.Decimal })).toBe('1234.5');
  });

  it('should format booleans as Sim/Não', () => {
    expect(service.format({ is_primary: true }, { field: 'is_primary', type: ColumnType.Boolean })).toBe('Sim');
    expect(service.format({ is_primary: false }, { field: 'is_primary', type: ColumnType.Boolean })).toBe('Não');
  });

  it('should format enums using the provided labels', () => {
    const value = service.format(
      { status: 'A' },
      { field: 'status', type: ColumnType.Enum, enumOptionLabels: { A: 'Ativo' } },
    );

    expect(value).toBe('Ativo');
  });

  it('should fall back to the raw value when the enum label is unknown', () => {
    const value = service.format(
      { status: 'Z' },
      { field: 'status', type: ColumnType.Enum, enumOptionLabels: { A: 'Ativo' } },
    );

    expect(value).toBe('Z');
  });

  it('should prefer an explicit pipe over the type', () => {
    const pipe = { transform: (value: unknown) => `custom:${String(value)}` };

    expect(service.format({ name: 'Ana' }, { field: 'name', type: ColumnType.Text, pipe })).toBe('custom:Ana');
  });
});