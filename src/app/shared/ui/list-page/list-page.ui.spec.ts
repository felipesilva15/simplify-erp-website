import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPageUi } from './list-page.ui';

describe('ListPageUi', () => {
  let component: ListPageUi;
  let fixture: ComponentFixture<ListPageUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPageUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPageUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
