import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionListPage } from './profession-list.page';

describe('ProfessionListPage', () => {
  let component: ProfessionListPage;
  let fixture: ComponentFixture<ProfessionListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
