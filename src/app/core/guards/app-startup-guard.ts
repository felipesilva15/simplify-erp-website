import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AppStartupService } from '../services/app-startup-service';

export const appStartupGuard: CanActivateFn = async () => {
  const appStartupService = inject(AppStartupService);
  
  await appStartupService.init();

  return true;
};
