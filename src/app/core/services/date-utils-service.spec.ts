import { TestBed } from '@angular/core/testing';

import { DateUtilsService } from './date-utils-service';

describe('DateUtilsService', () => {
  let service: DateUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseIsoDates', () => {
    it('should convert ISO date strings to local Date objects', () => {
      const result = service.parseIsoDates({ birth_date: '2024-01-15' });
      const birthDate = result.birth_date as unknown as Date;

      expect(birthDate).toBeInstanceOf(Date);
      expect(birthDate.getFullYear()).toBe(2024);
      expect(birthDate.getMonth()).toBe(0);
      expect(birthDate.getDate()).toBe(15);
    });

    it('should not affect fields that are not ISO date strings', () => {
      const data = {
        name: 'John',
        partner_type_code: 'CODE-1',
        created_at: '2024-01-15T10:30:00Z',
        active: true,
        count: 5,
      };

      const result = service.parseIsoDates(data);

      expect(result.name).toBe('John');
      expect(result.partner_type_code).toBe('CODE-1');
      expect(result.created_at).toBe('2024-01-15T10:30:00Z');
      expect(result.active).toBe(true);
      expect(result.count).toBe(5);
    });

    it('should not affect invalid date-like strings', () => {
      const result = service.parseIsoDates({ birth_date: '15/01/2024', note: '2024-01' });

      expect(result.birth_date).toBe('15/01/2024');
      expect(result.note).toBe('2024-01');
    });

    it('should convert multiple date fields', () => {
      const result = service.parseIsoDates({
        partner_since: '2020-03-01',
        birth_date: '1990-11-23',
      });
      const partnerSince = result.partner_since as unknown as Date;
      const birthDate = result.birth_date as unknown as Date;

      expect(partnerSince.getFullYear()).toBe(2020);
      expect(partnerSince.getMonth()).toBe(2);
      expect(partnerSince.getDate()).toBe(1);

      expect(birthDate.getFullYear()).toBe(1990);
      expect(birthDate.getMonth()).toBe(10);
      expect(birthDate.getDate()).toBe(23);
    });
  });

  describe('formatIsoDate', () => {
    it('should serialize a local Date to YYYY-MM-DD', () => {
      expect(service.formatIsoDate(new Date(2024, 0, 15))).toBe('2024-01-15');
    });

    it('should pad month and day with leading zeros', () => {
      expect(service.formatIsoDate(new Date(2024, 2, 9))).toBe('2024-03-09');
      expect(service.formatIsoDate(new Date(2024, 11, 31))).toBe('2024-12-31');
    });

    it('should round-trip a parsed date to the same YYYY-MM-DD', () => {
      const parsed = service.parseIsoDates({ birth_date: '2024-01-15' }).birth_date as unknown as Date;

      expect(service.formatIsoDate(parsed)).toBe('2024-01-15');
    });
  });
});