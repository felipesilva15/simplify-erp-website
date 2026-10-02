import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityListPage } from './city-list.page';

describe('CityListPage', () => {
  let component: CityListPage;
  let fixture: ComponentFixture<CityListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
