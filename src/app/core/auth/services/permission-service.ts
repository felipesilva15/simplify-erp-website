import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  constructor(private authService: AuthService) {}

  has(permission: string): boolean {
    if (this.authService.user?.permissions.includes('*')) {
      return true;
    }

    return this.authService.user?.permissions.includes(permission)  ?? false;
  }

  hasAny(permissions: string[]): boolean {
    return permissions.some(p => this.has(p));
  }
}
