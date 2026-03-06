import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormMode } from '../enums/form-mode';

@Injectable({
  providedIn: 'root',
})
export class RouteUtilsService {
  private router: Router = inject(Router);

  getFormModeFromCurrentUrl(): FormMode {
    if (this.router.url.includes('new')) {
      return FormMode.CREATE;
    } else if (this.router.url.includes('edit')) {
      return FormMode.EDIT;
    } else {
      return FormMode.VIEW;
    }
  }

  isRouteActive(url: string): boolean {
    if (!url) {
      return false;
    }

    const escapedUrl: string = this.escapeForRegex(this.sanatizeUrl(url));
    const viewFormPattern: RegExp = new RegExp(`${escapedUrl}\\/\\d+$`);
    const editFormPattern: RegExp = new RegExp(`${escapedUrl}\\/\\d+\\/edit$`);
    const createFormPattern: RegExp = new RegExp(`${escapedUrl}\\/new$`);

    const currentUrl: string = this.sanatizeUrl(this.router.url);

    return currentUrl == url || viewFormPattern.test(currentUrl) || editFormPattern.test(currentUrl) || createFormPattern.test(currentUrl);
  }

  private sanatizeUrl(url: string): string {
    return url
      .replace(/\?.*$/, '')
      .replace(/^\/?/, '/')
      .trim()
      .toLowerCase();
  }

  private escapeForRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
