import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { HttpQueryBuilderService } from './http-query-builder-service';

describe('HttpQueryBuilderService', () => {
  let service: HttpQueryBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpQueryBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buildHttpParams', () => {
    it('should return empty params when obj is null', () => {
      const result = service.buildHttpParams(null);
      expect(result.keys().length).toBe(0);
    });

    it('should return empty params when obj is undefined', () => {
      const result = service.buildHttpParams(undefined);
      expect(result.keys().length).toBe(0);
    });

    it('should return empty params when obj is empty object', () => {
      const result = service.buildHttpParams({});
      expect(result.keys().length).toBe(0);
    });

    it('should append primitive values without prefix', () => {
      const result = service.buildHttpParams({ name: 'John', age: 30 });
      expect(result.get('name')).toBe('John');
      expect(result.get('age')).toBe('30');
    });

    it('should append primitive values with prefix', () => {
      const result = service.buildHttpParams({ name: 'John' }, 'filter');
      expect(result.get('filter[name]')).toBe('John');
    });

    it('should append array values with [] suffix', () => {
      const result = service.buildHttpParams({ ids: [1, 2, 3] });
      expect(result.getAll('ids[]')).toEqual(['1', '2', '3']);
    });

    it('should append array values with prefix and [] suffix', () => {
      const result = service.buildHttpParams({ tags: ['a', 'b'] }, 'filter');
      expect(result.getAll('filter[tags][]')).toEqual(['a', 'b']);
    });

    it('should recursively build params for nested objects', () => {
      const result = service.buildHttpParams({ address: { city: 'SP', zip: '01000' } });
      expect(result.get('address[city]')).toBe('SP');
      expect(result.get('address[zip]')).toBe('01000');
    });

    it('should recursively build params for nested objects with prefix', () => {
      const result = service.buildHttpParams({ address: { city: 'SP' } }, 'user');
      expect(result.get('user[address][city]')).toBe('SP');
    });

    it('should handle deeply nested objects', () => {
      const obj = { a: { b: { c: 'deep' } } };
      const result = service.buildHttpParams(obj);
      expect(result.get('a[b][c]')).toBe('deep');
    });

    it('should handle mixed types in a flat object', () => {
      const obj = { name: 'John', age: 30, active: true };
      const result = service.buildHttpParams(obj);
      expect(result.get('name')).toBe('John');
      expect(result.get('age')).toBe('30');
      expect(result.get('active')).toBe('true');
    });

    it('should handle object with primitive, array, and nested object', () => {
      const obj = {
        name: 'John',
        ids: [1, 2],
        address: { city: 'SP' }
      };
      const result = service.buildHttpParams(obj);
      expect(result.get('name')).toBe('John');
      expect(result.getAll('ids[]')).toEqual(['1', '2']);
      expect(result.get('address[city]')).toBe('SP');
    });

    it('should preserve existing params when passed', () => {
      const existing = new HttpParams().set('existing', 'value');
      const result = service.buildHttpParams({ new: 'param' }, undefined, existing);
      expect(result.get('existing')).toBe('value');
      expect(result.get('new')).toBe('param');
    });

    it('should append to existing params without overwriting', () => {
      const existing = new HttpParams().set('key', 'first');
      const result = service.buildHttpParams({ key: 'second' }, undefined, existing);
      expect(result.getAll('key')).toEqual(['first', 'second']);
    });

    it('should handle null value in object as primitive', () => {
      const result = service.buildHttpParams({ val: null });
      expect(result.get('val')).toBe('null');
    });

    it('should handle empty array value', () => {
      const result = service.buildHttpParams({ items: [] });
      expect(result.keys().length).toBe(0);
    });

    it('should handle array with mixed types', () => {
      const result = service.buildHttpParams({ mixed: [1, 'two', true] });
      expect(result.getAll('mixed[]')).toEqual(['1', 'two', 'true']);
    });

    it('should handle nested object containing arrays', () => {
      const result = service.buildHttpParams({
        filters: { tags: ['a', 'b'], name: 'test' }
      });
      expect(result.getAll('filters[tags][]')).toEqual(['a', 'b']);
      expect(result.get('filters[name]')).toBe('test');
    });
  });
});
