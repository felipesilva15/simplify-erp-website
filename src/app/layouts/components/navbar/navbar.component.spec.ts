import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Mocked } from 'vitest';
import { of } from 'rxjs';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../core/auth/services/auth-service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog-service';
import { User } from '../../../features/security/users/models/user';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  let authService: Mocked<AuthService>;
  let confirmDialogService: Mocked<ConfirmDialogService>;
  let menuHideSpy: ReturnType<typeof vi.fn>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phone_number: '1234567890',
    is_admin: false,
    permissions: [],
    roles: [],
    avatar_url: 'https://example.com/avatar.png',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    authService = {
      get user() { return mockUser; },
      logout: vi.fn().mockReturnValue(of(undefined)),
    } as unknown as Mocked<AuthService>;

    confirmDialogService = {
      confirm: vi.fn(),
    } as unknown as Mocked<ConfirmDialogService>;

    menuHideSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    component.menu = { hide: menuHideSpy } as any;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set user from authService', () => {
      component.ngOnInit();
      expect(component.user).toBe(mockUser);
    });

    it('should set user to null when authService.user is null', () => {
      Object.defineProperty(authService, 'user', { get: () => null, configurable: true });
      component.ngOnInit();
      expect(component.user).toBeNull();
    });
  });

  describe('menuItems', () => {
    it('should have profile menu item', () => {
      const item = component.menuItems[0];
      expect(item.label).toBe('Meu perfil');
      expect(item.icon).toBe('pi pi-user');
      expect(item.routerLink).toBe('security/user/profile');
    });

    it('should have separator', () => {
      const item = component.menuItems[1];
      expect(item.separator).toBe(true);
    });

    it('should have logout menu item', () => {
      const item = component.menuItems[2];
      expect(item.label).toBe('Logout');
      expect(item.icon).toBe('pi pi-sign-out');
      expect(item.linkClass).toBe('text-red-500');
      expect(item.iconClass).toBe('text-red-500');
    });

    it('should call onLogout when logout item command is executed', () => {
      const spy = vi.spyOn(component, 'onLogout').mockReturnValue();
      const logoutItem = component.menuItems[2];
      logoutItem.command?.({} as any);
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('onLogout', () => {
    it('should hide the menu', () => {
      confirmDialogService.confirm.mockResolvedValue(false);
      component.onLogout();
      expect(menuHideSpy).toHaveBeenCalledOnce();
    });

    it('should call confirmDialogService.confirm with correct message', () => {
      confirmDialogService.confirm.mockResolvedValue(false);
      component.onLogout();
      expect(confirmDialogService.confirm).toHaveBeenCalledWith({
        message: 'Deseja mesmo realizar logout do sistema?',
      });
    });

    it('should call authService.logout when confirmed', async () => {
      confirmDialogService.confirm.mockResolvedValue(true);
      component.onLogout();
      await fixture.whenStable();
      expect(authService.logout).toHaveBeenCalledOnce();
    });

    it('should not call authService.logout when not confirmed', async () => {
      confirmDialogService.confirm.mockResolvedValue(false);
      component.onLogout();
      await fixture.whenStable();
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });
});
