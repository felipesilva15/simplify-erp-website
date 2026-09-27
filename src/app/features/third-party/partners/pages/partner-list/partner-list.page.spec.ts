import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerListPage } from './partner-list.page';

describe('PartnerListPage', () => {
  let component: PartnerListPage;
  let fixture: ComponentFixture<PartnerListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
