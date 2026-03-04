import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastConfig } from '../../core/models/toast-config';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService: MessageService = inject(MessageService);

  show(config: ToastConfig): void {
    this.messageService.add({
      severity: config.severity,
      summary: config.title,
      detail: config.message,
      life: config.life ?? 5000
    });
  }

  clear(): void {
    this.messageService.clear();
  }
}
