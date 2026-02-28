import { AppLoadingService } from './app-loading-service';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/services/auth-service';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class AppStartupService {
  private authService: AuthService = inject(AuthService);
  private appLoadingService: AppLoadingService = inject(AppLoadingService);
  private messageService: MessageService = inject(MessageService);

  private _initalized = new ReplaySubject<boolean>(1);
  initalized$ = this._initalized.asObservable();

  async init() {
    this.messageService.clear();

    this.appLoadingService.start();
    
    await Promise.all([
      this.authService.loadUser(),
      new Promise(r => setTimeout(r, 800))
    ]);

    this.appLoadingService.stop();
    this._initalized.next(true);
  }
}
