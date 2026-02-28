import { CanDeactivateFn } from '@angular/router';

export const pendingChangesGuard: CanDeactivateFn<unknown> = async (component: any) => {
  if (!component?.facade?.canDeactivate) {
    return true;
  }

  return await component.facade.canDeactivate();
};
