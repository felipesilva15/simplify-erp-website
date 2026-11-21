import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeFormDialog } from './project-type-form.dialog';

describe('ProjectTypeFormDialog', () => {
  let component: ProjectTypeFormDialog;
  let fixture: ComponentFixture<ProjectTypeFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTypeFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTypeFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
