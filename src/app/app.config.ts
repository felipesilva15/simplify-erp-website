import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { errorResponseInterceptor } from './core/interceptors/error-response-interceptor';
import { THEME } from './core/config/theme';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TRANSLATION } from './core/config/translation';
import { DialogService } from 'primeng/dynamicdialog';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    ConfirmationService,
    DialogService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorResponseInterceptor])),
    providePrimeNG({
      ripple: true,
      inputStyle: 'outlined',
      theme: THEME,
      translation: TRANSLATION
    }),
    provideEnvironmentNgxMask({
      validation: true,
      maskAliases: {
        TELEFONE_CELULAR_BR: '(00) 0000-0000||(00) 00000-0000' 
      }
    })
  ]
};
