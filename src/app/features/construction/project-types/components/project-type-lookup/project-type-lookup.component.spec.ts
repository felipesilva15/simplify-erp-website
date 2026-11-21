import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeLookupComponent } from './project-type-lookup.component';

describe('ProjectTypeLookupComponent', () => {
  let component: ProjectTypeLookupComponent;
  let fixture: ComponentFixture<ProjectTypeLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTypeLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTypeLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
