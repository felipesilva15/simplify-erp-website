import { AppLoadingService } from './app-loading-service';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class AppStartupService {
  private authService: AuthService = inject(AuthService);
  private appLoadingService: AppLoadingService = inject(AppLoadingService);

  async init() {
    this.appLoadingService.start();
    
    await Promise.all([
      this.authService.loadUser(),
      new Promise(r => setTimeout(r, 800))
    ]);

    this.appLoadingService.stop();
  }
}
