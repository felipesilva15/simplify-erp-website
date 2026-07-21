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
});
