import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudListComponent } from './crud-list.component';

describe('CrudListComponent', () => {
  let component: CrudListComponent<any>;
  let fixture: ComponentFixture<CrudListComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
