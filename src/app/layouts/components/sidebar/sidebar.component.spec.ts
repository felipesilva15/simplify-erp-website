import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { MenuService } from '../../../core/services/menu-service';
import { LogoType } from '../../../shared/enums/logo-type';
import { MenuItem } from 'primeng/api';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let menuServiceMock: {
    getMenu: ReturnType<typeof vi.fn>;
    updateMenuActivation: ReturnType<typeof vi.fn>;
  };
  let router: Router;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let routerEvents$: Subject<any>;

  const mockMenuItems: MenuItem[] = [
    { label: 'Home', icon: 'pi pi-home', link: '/home' },
    { label: 'Settings', icon: 'pi pi-cog', link: '/settings' },
  ];

  const fullMockMenuItems: MenuItem[] = [
    { label: 'Home', icon: 'pi pi-home', link: '/home' },
    { separator: true },
    {
      label: 'Administration',
      icon: 'pi pi-cog',
      link: '/admin',
      items: [
        { label: 'Users', icon: 'pi pi-users', link: '/admin/users' },
      ],
    },
    {
      label: 'Reports',
      icon: 'pi pi-chart-bar',
      items: [
        { label: 'Sales', icon: 'pi pi-dollar', link: '/reports/sales' },
      ],
    },
  ];

  beforeEach(async () => {
    routerEvents$ = new Subject();

    menuServiceMock = {
      getMenu: vi.fn().mockReturnValue(mockMenuItems),
      updateMenuActivation: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: MenuService, useValue: menuServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'events', 'get').mockReturnValue(routerEvents$);

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should call menuService.getMenu and assign to menu', () => {
      expect(menuServiceMock.getMenu).toHaveBeenCalledOnce();
      expect(component.menu).toEqual(mockMenuItems);
    });
  });

  describe('ngOnInit', () => {
    it('should call updateMenuActivation with menu on init', () => {
      fixture.detectChanges();
      expect(menuServiceMock.updateMenuActivation).toHaveBeenCalledWith(mockMenuItems);
    });

    it('should subscribe to router events and call updateMenuActivation on NavigationEnd', () => {
      fixture.detectChanges();

      const navigationEnd = new NavigationEnd(1, '/home', '/home');
      routerEvents$.next(navigationEnd);

      expect(menuServiceMock.updateMenuActivation).toHaveBeenCalledTimes(2);
      expect(menuServiceMock.updateMenuActivation).toHaveBeenLastCalledWith(mockMenuItems);
    });

    it('should not call updateMenuActivation for non-NavigationEnd events', () => {
      fixture.detectChanges();

      routerEvents$.next({ id: 1, url: '/test' });

      expect(menuServiceMock.updateMenuActivation).toHaveBeenCalledTimes(1);
    });
  });

  describe('signals', () => {
    describe('isExpanded', () => {
      it('should default to true', () => {
        expect(component.isExpanded()).toBe(true);
      });
    });

    describe('windowWidth', () => {
      it('should default to window.innerWidth', () => {
        expect(component.windowWidth()).toBe(window.innerWidth);
      });
    });

    describe('isMobileScreen', () => {
      it('should return true when windowWidth is 576', () => {
        component.windowWidth.set(576);
        expect(component.isMobileScreen()).toBe(true);
      });

      it('should return true when windowWidth is less than 576', () => {
        component.windowWidth.set(400);
        expect(component.isMobileScreen()).toBe(true);
      });

      it('should return false when windowWidth is greater than 576', () => {
        component.windowWidth.set(1024);
        expect(component.isMobileScreen()).toBe(false);
      });
    });

    describe('logoType', () => {
      it('should return LogoType.Mini when on mobile screen', () => {
        component.windowWidth.set(400);
        expect(component.logoType()).toBe(LogoType.Mini);
      });

      it('should return LogoType.Extended when not on mobile screen', () => {
        component.windowWidth.set(1024);
        expect(component.logoType()).toBe(LogoType.Extended);
      });
    });

    describe('showSidebar', () => {
      it('should return false when on mobile screen', () => {
        component.windowWidth.set(400);
        component.isExpanded.set(true);
        expect(component.showSidebar()).toBe(false);
      });

      it('should return true when not on mobile screen and isExpanded is true', () => {
        component.windowWidth.set(1024);
        component.isExpanded.set(true);
        expect(component.showSidebar()).toBe(true);
      });

      it('should return false when not on mobile screen and isExpanded is false', () => {
        component.windowWidth.set(1024);
        component.isExpanded.set(false);
        expect(component.showSidebar()).toBe(false);
      });
    });
  });

  describe('toggle', () => {
    it('should toggle isExpanded from true to false', () => {
      expect(component.isExpanded()).toBe(true);
      component.toggle();
      expect(component.isExpanded()).toBe(false);
    });

    it('should toggle isExpanded from false to true', () => {
      component.isExpanded.set(false);
      component.toggle();
      expect(component.isExpanded()).toBe(true);
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      menuServiceMock.getMenu.mockReturnValue(fullMockMenuItems);
      component.menu = fullMockMenuItems;
    });

    it('should apply expanded class when showSidebar is true', () => {
      component.windowWidth.set(1024);
      component.isExpanded.set(true);
      fixture.detectChanges();

      const aside = fixture.nativeElement.querySelector('aside');
      expect(aside.classList.contains('expanded')).toBe(true);
    });

    it('should not apply expanded class when showSidebar is false', () => {
      component.windowWidth.set(1024);
      component.isExpanded.set(false);
      fixture.detectChanges();

      const aside = fixture.nativeElement.querySelector('aside');
      expect(aside.classList.contains('expanded')).toBe(false);
    });

    it('should render menu items with link', () => {
      fixture.detectChanges();

      const menuItems = fixture.nativeElement.querySelectorAll('.menu-item');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should render chevron for items with sub-items', () => {
      fixture.detectChanges();

      const chevrons = fixture.nativeElement.querySelectorAll('.pi-chevron-right');
      expect(chevrons.length).toBeGreaterThan(0);
    });

    it('should render separator divider items', () => {
      fixture.detectChanges();

      const dividers = fixture.nativeElement.querySelectorAll('p-divider');
      expect(dividers.length).toBeGreaterThan(0);
    });

    it('should render menu items without link (group headers)', () => {
      fixture.detectChanges();

      const menuItems = fixture.nativeElement.querySelectorAll('.menu-item');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should render chevron on link-less items that have sub-items', () => {
      component.menu = [
        {
          label: 'Reports',
          icon: 'pi pi-chart-bar',
          expanded: true,
          items: [
            { label: 'Sales', icon: 'pi pi-dollar', link: '/reports/sales' },
          ],
        },
      ];
      fixture.detectChanges();

      const chevrons = fixture.nativeElement.querySelectorAll('.pi-chevron-right');
      expect(chevrons.length).toBeGreaterThan(0);
    });
  });
});
