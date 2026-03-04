import { inject, Injectable } from '@angular/core';
import { ConfirmDialogConfig } from '../../core/models/confirm-dialog-config';
import { ConfirmationService } from 'primeng/api';
import { ButtonProps } from 'primeng/button';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private confirmationService: ConfirmationService = inject(ConfirmationService);

  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    const rejectButtonProps = {
      ...config,
      label: config.rejectButtonProps?.label ?? 'Não',
      severity: config.rejectButtonProps?.severity ?? 'secondary'
    }
    const acceptButtonProps = {
      ...config,
      label: config.acceptButtonProps?.label ?? 'Sim',
      severity: config.acceptButtonProps?.severity
    }

    return new Promise((resolve) => {
      this.confirmationService.confirm({
        header: config.header ?? 'Atenção',
        message: config.message,
        icon: config.icon,
        rejectButtonProps: rejectButtonProps,
        acceptButtonProps: acceptButtonProps,
        accept: () => resolve(true),
        reject: () => resolve(false)
      })
    });
  }
}
