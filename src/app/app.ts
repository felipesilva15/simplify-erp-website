import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from './core/auth/services/auth-service';
import { User } from './features/security/users/models/user';
import { tap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule],
  template: `
    <router-outlet />
  `
})
export class App {
  protected readonly title = signal('simplify-erp');
}
