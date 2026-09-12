import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { SidebarDrawerContentComponent } from './sidebar-drawer-content.component';
import { MenuService } from '../../../core/services/menu-service';
import { DrawerRef } from '../../../core/lib/drawer-ref';
import { DRAWER_REF } from '../../../core/models/drawer-tokens';
import { MenuItem } from 'primeng/api';

describe('SidebarDrawerContentComponent', () => {
  let component: SidebarDrawerContentComponent;
  let fixture: ComponentFixture<SidebarDrawerContentComponent>;
  let menuServiceMock: {
    getMenu: ReturnType<typeof vi.fn>;
    updateMenuActivation: ReturnType<typeof vi.fn>;
  };
  let routerEvents$: Subject<unknown>;

  const mockMenuItems: MenuItem[] = [
    { label: 'Home', icon: 'pi pi-home', link: '/home' },
  ];

  beforeEach(async () => {
    routerEvents$ = new Subject();

    menuServiceMock = {
      getMenu: vi.fn().mockReturnValue(mockMenuItems),
      updateMenuActivation: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SidebarDrawerContentComponent],
      providers: [
        provideRouter([]),
        { provide: MenuService, useValue: menuServiceMock },
        { provide: DRAWER_REF, useValue: new DrawerRef() },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'events', 'get').mockReturnValue(routerEvents$ as never);

    fixture = TestBed.createComponent(SidebarDrawerContentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load menu from MenuService', () => {
    expect(menuServiceMock.getMenu).toHaveBeenCalled();
    expect(component.menu).toEqual(mockMenuItems);
  });

  it('should update menu activation on init', () => {
    component.ngOnInit();
    expect(menuServiceMock.updateMenuActivation).toHaveBeenCalledWith(mockMenuItems);
  });

  it('should close the drawer after a navigation end', () => {
    const drawerRef = TestBed.inject(DRAWER_REF) as DrawerRef;
    const closeSpy = vi.spyOn(drawerRef, 'close');
    component.ngOnInit();

    routerEvents$.next(new NavigationEnd(1, '/home', '/home'));

    expect(menuServiceMock.updateMenuActivation).toHaveBeenCalledTimes(2);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should render menu items with link', () => {
    fixture.detectChanges();

    const menuItems = fixture.nativeElement.querySelectorAll('.menu-item');
    expect(menuItems.length).toBeGreaterThan(0);
  });
});