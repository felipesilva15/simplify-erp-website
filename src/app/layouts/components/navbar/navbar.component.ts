import { ConfirmDialogService } from './../../../shared/services/confirm-dialog-service';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LogoType } from '../../../shared/enums/logo-type';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/auth/services/auth-service';
import { User } from '../../../features/security/users/models/user';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

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

  onLogout(): void {
    this.menu.hide();

    this.confirmDialogService.confirm({
      message: 'Deseja mesmo realizar logout do sistema?'
    })
    .then((confirmed: boolean) => {
      console.log(confirmed)

      if (!confirmed) {
        return;
      }

      this.authService.logout().subscribe();
    });
  }
}
