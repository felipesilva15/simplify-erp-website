import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppLoadingService {
  _isLoading: WritableSignal<boolean> = signal<boolean>(false)
  _message: WritableSignal<string> = signal<string>('');
  
  isLoading: Signal<boolean> = this._isLoading.asReadonly();
  message: Signal<string> = this._message.asReadonly();

  start(message?: string): void {
    this._message.set(message ? message : 'Carregando. Aguarde...');
    this._isLoading.set(true);
  }

  stop(): void {
    this._message.set('');
    this._isLoading.set(false);
  }
}
