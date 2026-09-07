import { TestBed } from '@angular/core/testing';
import { DialogRefreshService } from './dialog-refresh.service';
import { vi } from 'vitest';

describe('DialogRefreshService', () => {
  let service: DialogRefreshService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit on saved$ when notifySaved is called', () => {
    const spy = vi.fn();
    service.saved$.subscribe(spy);

    service.notifySaved();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit when notifySaved is not called', () => {
    const spy = vi.fn();
    service.saved$.subscribe(spy);

    expect(spy).not.toHaveBeenCalled();
  });
});