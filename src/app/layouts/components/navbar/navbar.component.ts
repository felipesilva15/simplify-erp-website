import { Component, computed, inject, OnInit, Signal, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { AuthService } from '../../../core/auth/services/auth-service';
import { ThemeService } from '../../../core/services/theme-service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog-service';
import { User } from '../../../features/security/users/models/user';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule,
    AvatarModule,
    MenuModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private authService: AuthService = inject(AuthService);
  private confirmDialogService: ConfirmDialogService = inject(ConfirmDialogService);
  private themeService: ThemeService = inject(ThemeService);

  themeIcon: Signal<string> = computed(() =>
    this.themeService.theme() === 'dark' ? 'pi pi-moon' : 'pi pi-sun'
  );
  menuItems: MenuItem[] = [
    {
      label: 'Meu perfil',
      icon: 'pi pi-user',
      routerLink: 'security/user/profile'
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout(),
      linkClass: 'text-red-500',
      iconClass: 'text-red-500'
    }
  ]
  user!: User | null;

  @ViewChild('menu') menu!: Menu;

  ngOnInit(): void {
    this.user = this.authService.user;
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    this.menu.hide();

    void this.confirmDialogService.confirm({
      message: 'Deseja mesmo realizar logout do sistema?'
    })
    .then((confirmed: boolean) => {
      if (confirmed) {
        this.authService.logout().subscribe();
      }
    });
  }
}
