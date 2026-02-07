import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export const errorResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
      tap({
        error: (err: any) => {
          switch (err.status) {
            case 401:
              if (!req.url.includes('/security/auth/login'))
                router.navigate(['/security/auth/login']);
              break;

            case 403:
              router.navigate(['/error/403']);
              break;

            case 404:
              router.navigate(['/error/404']);
              break;
          
            default:
              break;
          }
        }
      })
    );
};
