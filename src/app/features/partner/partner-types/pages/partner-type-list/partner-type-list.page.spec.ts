import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerTypeListPage } from './partner-type-list.page';

describe('PartnerTypeListPage', () => {
  let component: PartnerTypeListPage;
  let fixture: ComponentFixture<PartnerTypeListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerTypeListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerTypeListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
