import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast-service';
import { MessageService } from 'primeng/api';
import { ToastConfig } from '../../core/models/toast-config';

describe('ToastService', () => {
  let service: ToastService;
  let messageService: { 
    add: ReturnType<typeof vi.fn>,
    clear: ReturnType<typeof vi.fn> 
  };

  beforeEach(() => {
    messageService = {
      add: vi.fn(),
      clear: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: messageService },
      ],
    });

    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show toast', () => {
    const config: ToastConfig = {
      message: 'Sucesso'
    };

    service.show(config);
    expect(messageService.add).toHaveBeenCalled();
  });

  it('should clear toast', () => {
    service.clear();
    expect(messageService.clear).toHaveBeenCalled();
  });
});
