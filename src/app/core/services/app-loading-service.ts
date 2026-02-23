import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppLoadingService {
  readonly isLoading: WritableSignal<boolean> = signal<boolean>(false);
  readonly message: WritableSignal<string> = signal<string>('');

  start(message?: string): void {
    this.message.set(message ? message : 'Carregando. Aguarde...');
    this.isLoading.set(true);
  }

  stop(): void {
    this.message.set('');
    this.isLoading.set(false);
  }
}
