import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryListPage } from './country-list.page';

describe('CountryListPage', () => {
  let component: CountryListPage;
  let fixture: ComponentFixture<CountryListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
