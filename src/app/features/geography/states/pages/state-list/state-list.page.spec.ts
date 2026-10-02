import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateListPage } from './state-list.page';

describe('StateListPage', () => {
  let component: StateListPage;
  let fixture: ComponentFixture<StateListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
