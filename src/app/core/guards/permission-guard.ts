import { AuthService } from './../auth/services/auth-service';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../auth/services/permission-service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppStartupService } from '../services/app-startup-service';

export const permissionGuard: CanActivateFn = async (route) => {
  const permissionService: PermissionService = inject(PermissionService);
  const router: Router = inject(Router);
  const appStartupService: AppStartupService = inject(AppStartupService);

  const permission = route.data?.['permission'];

  await firstValueFrom(appStartupService.initalized$);

  if (!permission || permissionService.has(permission)) {
    return true;
  }

  if (!router.url.includes('error')) {
    router.navigate(['/error/403']);
  }

  return false;
};
