import { Injectable } from '@angular/core';
import { ConfirmDialogConfig } from '../../core/models/confirm-dialog-config';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    return new Promise(resolve => {
      const confirmed = window.confirm(config.message);
      resolve(confirmed);
    });
  }
}
