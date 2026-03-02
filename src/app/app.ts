import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLoadingService } from './core/services/app-loading-service';
import { SplashScreenComponent } from "./shared/components/splash-screen/splash-screen.component";
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SplashScreenComponent,
    ToastModule
  ],
  template: `
    <p-toast></p-toast>
    @if (isLoading()) {
      <app-splash-screen [message]="loadingMessage()" />
    } @else {
      <router-outlet />
    }
  `
})
export class App {
  protected readonly title = signal('simplify-erp');
  isLoading = inject(AppLoadingService).isLoading;
  loadingMessage = inject(AppLoadingService).message;
}
