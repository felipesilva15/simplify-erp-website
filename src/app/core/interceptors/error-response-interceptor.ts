import { AppLoadingService } from './../services/app-loading-service';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ToastService } from '../../shared/services/toast-service';
import { AuthService } from '../auth/services/auth-service';

export const errorResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const appLoadingService: AppLoadingService = inject(AppLoadingService);
  const toastService: ToastService = inject(ToastService);
  const authService: AuthService = inject(AuthService)
  
  return next(req).pipe(
      tap({
        error: (err: any) => {
          switch (err.status) {
            case 401:
              if (!req.url.includes('/security/auth/login')) {
                toastService.show({
                  severity: 'error',
                  title: 'Ops...',
                  message: 'Você precisa fazer login para acessar este recurso!',
                  life: 7000
                });

                void router.navigate(['/security/auth/login']);
              }
              break;

            case 403:
              void router.navigate(['/error', 403], {
                state: {
                  username: authService.user?.username ?? ''
                }
              });
              break;

            case 404:
              void router.navigate(['/error', 404], {
                state: {
                  username: authService.user?.username ?? ''
                }
              });
              break;

            case 500:
              void router.navigate(['/error', 500], {
                state: {
                  username: authService.user?.username ?? ''
                }
              });
              break;

            case 502:
              void router.navigate(['/error', 502], {
                state: {
                  username: authService.user?.username ?? ''
                }
              });
              break;

            case 503:
              void router.navigate(['/error', 503], {
                state: {
                  username: authService.user?.username ?? ''
                }
              });
              break;

            default:
              if (err.statusText === 'Unknown Error') {
                void router.navigate(['/error', 503], {
                  state: {
                    username: authService.user?.username ?? ''
                  }
                });
              }
              break;
          }

          appLoadingService.stop();
        }
      })
    );
};
