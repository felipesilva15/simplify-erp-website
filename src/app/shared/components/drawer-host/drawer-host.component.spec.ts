import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawerHostComponent } from './drawer-host.component';

describe('DrawerHostComponent', () => {
  let component: DrawerHostComponent;
  let fixture: ComponentFixture<DrawerHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawerHostComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
