import { ToastService } from './../../shared/services/toast-service';
import { AppLoadingService } from './app-loading-service';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/services/auth-service';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppStartupService {
  private authService: AuthService = inject(AuthService);
  private appLoadingService: AppLoadingService = inject(AppLoadingService);
  private toastService: ToastService = inject(ToastService);

  private _initalized = new ReplaySubject<boolean>(1);
  initalized$ = this._initalized.asObservable();

  async init() {
    this.toastService.clear();

    this.appLoadingService.start();
    
    await Promise.all([
      this.authService.loadUser(),
      new Promise(r => setTimeout(r, 800))
    ]);

    this.appLoadingService.stop();
    this._initalized.next(true);
  }
}
