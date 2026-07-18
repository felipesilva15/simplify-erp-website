import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayout } from './main.layout';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: '',
})
class MockSidebarComponent {}

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '',
})
class MockNavbarComponent {}

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [MainLayout]
    })
    .overrideComponent(MainLayout, {
      remove: {
        imports: [SidebarComponent, NavbarComponent],
      },
      add: {
        imports: [MockSidebarComponent, MockNavbarComponent],
      },
    })
    .compileComponents();;

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the child components', () => {
    const sidebarComponentElement = fixture.debugElement.query(By.css('app-sidebar'));
    const navbarComponentElement = fixture.debugElement.query(By.css('app-navbar'));
    const routerOutletElement = fixture.debugElement.query(By.css('router-outlet'));

    expect(sidebarComponentElement).toBeTruthy();
    expect(navbarComponentElement).toBeTruthy();
    expect(routerOutletElement).toBeTruthy();
  });
});

