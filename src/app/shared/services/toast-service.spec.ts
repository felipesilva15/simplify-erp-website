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

  describe('show', () => {
    it('should call messageService.add with mapped config properties', () => {
      const config: ToastConfig = {
        severity: 'success',
        title: 'Sucesso',
        message: 'Operação realizada com sucesso',
        life: 3000,
      };

      service.show(config);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Operação realizada com sucesso',
        life: 3000,
      });
    });

    it('should default life to 5000 when not provided', () => {
      const config: ToastConfig = {
        message: 'Mensagem',
      };

      service.show(config);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: undefined,
        summary: undefined,
        detail: 'Mensagem',
        life: 5000,
      });
    });

    it('should default life to 5000 when life is null', () => {
      const config: ToastConfig = {
        message: 'Mensagem',
        life: null as unknown as number,
      };

      service.show(config);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: undefined,
        summary: undefined,
        detail: 'Mensagem',
        life: 5000,
      });
    });

    it('should pass all severity values correctly', () => {
      const severities = ['error', 'success', 'info', 'warn', 'contrast', 'secondary'] as const;

      severities.forEach(severity => {
        messageService.add.mockClear();
        const config: ToastConfig = { message: 'Test', severity };
        service.show(config);
        expect(messageService.add).toHaveBeenCalledWith(
          expect.objectContaining({ severity })
        );
      });
    });
  });

  describe('clear', () => {
    it('should call messageService.clear', () => {
      service.clear();
      expect(messageService.clear).toHaveBeenCalled();
    });

    it('should call messageService.clear only once per call', () => {
      service.clear();
      service.clear();
      expect(messageService.clear).toHaveBeenCalledTimes(2);
    });
  });
});
