import { TestBed } from '@angular/core/testing';

import { AppLoadingService } from './app-loading-service';

describe('AppLoadingService', () => {
  let service: AppLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('start', () => {
    it('should set isLoading to true and set the default message', () => {
      service.start();
      expect(service.isLoading()).toBe(true);
      expect(service.message()).not.toBe('');
    });

    it('should set isLoading to true and set the message', () => {
      service.start('Loading...');
      expect(service.isLoading()).toBe(true);
      expect(service.message()).toBe('Loading...');
    });
  });

  describe('stop', () => {
    it('should set isLoading to false and set clean the message', () => {
      service.start();
      service.stop();
      expect(service.isLoading()).toBe(false);
      expect(service.message()).toBe('');
    });
  });
});
