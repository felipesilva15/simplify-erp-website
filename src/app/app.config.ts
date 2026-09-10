import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
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
import { MASK_ALIASES } from './core/config/masks-aliases';

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
      maskAliases: MASK_ALIASES
    })
  ]
};
