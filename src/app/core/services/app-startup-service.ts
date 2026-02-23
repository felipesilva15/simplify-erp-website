import { AppLoadingService } from './app-loading-service';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/services/auth-service';
import { firstValueFrom, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppStartupService {
  private authService: AuthService = inject(AuthService);
  private appLoadingService: AppLoadingService = inject(AppLoadingService);
  private router: Router = inject(Router);

  async init() {
    if (this.router.url.includes('/security/auth/login')) {
      return;
    }

    this.appLoadingService.start();

    await Promise.all([
      this.authService.loadUser(),
      new Promise(r => setTimeout(r, 800))
    ]);

    this.appLoadingService.stop();
  }
}
