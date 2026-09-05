import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormMode } from '../enums/form-mode';

@Injectable({
  providedIn: 'root',
})
export class RouteUtilsService {
  private router: Router = inject(Router);

  getFormModeFromCurrentUrl(): FormMode {
    const url: string = this.sanatizeUrl(this.router.url);

    if (url.endsWith('/new')) {
      return FormMode.Create;
    }

    if (url.endsWith('/edit')) {
      return FormMode.Edit;
    }

    if (/\/\d+\//.test(url)) {
      return FormMode.Custom;
    }

    return FormMode.View;
  }

  isRouteActive(url: string): boolean {
    if (!url) {
      return false;
    }

    const normalizedUrl: string = this.sanatizeUrl(url);
    const currentUrl: string = this.sanatizeUrl(this.router.url);

    return currentUrl === normalizedUrl || currentUrl.startsWith(`${normalizedUrl}/`);
  }

  private sanatizeUrl(url: string): string {
    return url
      .replace(/\?.*$/, '')
      .replace(/^\/?/, '/')
      .trim()
      .toLowerCase();
  }
}
