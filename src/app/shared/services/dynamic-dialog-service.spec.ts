import { TestBed } from '@angular/core/testing';
import { DialogService } from 'primeng/dynamicdialog';

import { DynamicDialogService } from './dynamic-dialog-service';

describe('DynamicDialogService', () => {
  let service: DynamicDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DialogService],
    });
    service = TestBed.inject(DynamicDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('closes the current dialog ref when close() is called', () => {
    const ref = { close: vi.fn() } as any;
    service.ref = ref;

    service.close();

    expect(ref.close).toHaveBeenCalled();
    expect(service.ref).toBeNull();
  });
});
