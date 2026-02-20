import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { AuthService } from './core/auth/services/auth-service';
import { errorResponseInterceptor } from './core/interceptors/error-response-interceptor';
import { THEME } from './core/config/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorResponseInterceptor])),
    providePrimeNG({
      ripple: true,
      inputStyle: 'outlined',
      theme: {
        preset: THEME,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark-mode',
          cssLayer: false
        }
      }
    }),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.loadUser();
    })
  ]
};
