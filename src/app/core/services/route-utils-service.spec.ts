import { TestBed } from '@angular/core/testing';

import { RouteUtilsService } from './route-utils-service';
import { Router } from '@angular/router';
import { FormMode } from '../enums/form-mode';

describe('RouteUtilsService', () => {
  let service: RouteUtilsService;
  let router: { url: string }

  beforeEach(() => {
    router = {
      url: '/'
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(RouteUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFormModeFromCurrentUrl', () => {
    it('should return CREATE form mode when the url ends with /new', () => {
      router.url = '/test/new';
      expect(service.getFormModeFromCurrentUrl()).toBe(FormMode.CREATE);
    });

    it('should return EDIT form mode when the url ends with /edit', () => {
      router.url = '/test/123/edit';
      expect(service.getFormModeFromCurrentUrl()).toBe(FormMode.EDIT);
    });

    it('should return VIEW form mode when the url does not end with /new or /edit', () => {
      router.url = '/test';
      expect(service.getFormModeFromCurrentUrl()).toBe(FormMode.VIEW);
    });

    it('should return VIEW form mode when the url contains "new" but does not end with /new', () => {
      router.url = '/test/newUser';
      expect(service.getFormModeFromCurrentUrl()).toBe(FormMode.VIEW);
    });

    it('should return VIEW form mode when the url contains "edit" but does not end with /edit', () => {
      router.url = '/test/editUser';
      expect(service.getFormModeFromCurrentUrl()).toBe(FormMode.VIEW);
    });
  });

  describe('isRouteActive', () => {
    it('should return false when url is empty', () => {
      router.url = '/test';
      expect(service.isRouteActive('')).toBe(false);
    });

    it('should return true when currentUrl matches the url exactly', () => {
      router.url = '/test';
      expect(service.isRouteActive('/test')).toBe(true);
    });

    it('should return true when currentUrl matches view pattern (url/id)', () => {
      router.url = '/test/123';
      expect(service.isRouteActive('/test')).toBe(true);
    });

    it('should return true when currentUrl matches edit pattern (url/id/edit)', () => {
      router.url = '/test/123/edit';
      expect(service.isRouteActive('/test')).toBe(true);
    });

    it('should return true when currentUrl matches create pattern (url/new)', () => {
      router.url = '/test/new';
      expect(service.isRouteActive('/test')).toBe(true);
    });

    it('should return false when currentUrl does not match any pattern', () => {
      router.url = '/other';
      expect(service.isRouteActive('/test')).toBe(false);
    });

    it('should ignore query parameters in currentUrl', () => {
      router.url = '/test?param=value';
      expect(service.isRouteActive('/test')).toBe(true);
    });

    it('should handle url without leading slash in view pattern match', () => {
      router.url = '/test/123';
      expect(service.isRouteActive('test')).toBe(true);
    });

    it('should lowercase urls for comparison', () => {
      router.url = '/Test';
      expect(service.isRouteActive('/test')).toBe(true);
    });

    it('should handle regex special characters in url', () => {
      router.url = '/test(1)';
      expect(service.isRouteActive('/test(1)')).toBe(true);
    });
  });
});
