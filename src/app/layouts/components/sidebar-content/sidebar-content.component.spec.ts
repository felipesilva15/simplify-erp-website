import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarContentComponent } from './sidebar-content.component';
import { MenuItem } from 'primeng/api';
import { LogoType } from '../../../../shared/enums/logo-type';

describe('SidebarContentComponent', () => {
  let component: SidebarContentComponent;
  let fixture: ComponentFixture<SidebarContentComponent>;

  const mockMenuItems: MenuItem[] = [
    { separator: true },
    { label: 'Home', icon: 'pi pi-home', link: '/home' },
    { label: 'Reports', icon: 'pi pi-chart-bar', items: [{ label: 'Sales', icon: 'pi pi-dollar', link: '/reports/sales' }] },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarContentComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarContentComponent);
    component = fixture.componentInstance;
    component.menu = mockMenuItems;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs defaults', () => {
    it('should default logoType to LogoType.Extended', () => {
      expect(component.logoType).toBe(LogoType.Extended);
    });

    it('should default buttonIcon to dock_to_right', () => {
      expect(component.buttonIcon).toBe('dock_to_right');
    });

    it('should default expanded to true', () => {
      expect(component.expanded).toBe(true);
    });
  });

  describe('onAction', () => {
    it('should emit the action event', () => {
      const actionSpy = vi.spyOn(component.action, 'emit');

      component.onAction();

      expect(actionSpy).toHaveBeenCalledOnce();
    });
  });

  describe('template rendering', () => {
    it('should apply expanded class when expanded is true', () => {
      fixture.detectChanges();

      const actionBlock = fixture.nativeElement.querySelector('.action-block');
      expect(actionBlock.classList.contains('expanded')).toBe(true);
    });

    it('should not apply expanded class when expanded is false', () => {
      component.expanded = false;
      fixture.detectChanges();

      const actionBlock = fixture.nativeElement.querySelector('.action-block');
      expect(actionBlock.classList.contains('expanded')).toBe(false);
    });

    it('should render the button with the provided icon', () => {
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.action-block button span');
      expect(button.textContent.trim()).toBe('dock_to_right');
    });

    it('should emit action when the button is clicked', () => {
      const actionSpy = vi.spyOn(component.action, 'emit');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.action-block button');

      button.click();

      expect(actionSpy).toHaveBeenCalledOnce();
    });

    it('should render menu items with link', () => {
      fixture.detectChanges();

      const menuItems = fixture.nativeElement.querySelectorAll('.menu-item');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should render separator divider items', () => {
      fixture.detectChanges();

      const dividers = fixture.nativeElement.querySelectorAll('p-divider');
      expect(dividers.length).toBeGreaterThan(0);
    });

    it('should render chevron for items with sub-items', () => {
      fixture.detectChanges();

      const chevrons = fixture.nativeElement.querySelectorAll('.pi-chevron-right');
      expect(chevrons.length).toBeGreaterThan(0);
    });
  });
});