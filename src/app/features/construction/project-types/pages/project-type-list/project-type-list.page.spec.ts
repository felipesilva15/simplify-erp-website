import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeListPage } from './project-type-list.page';

describe('ProjectTypeListPage', () => {
  let component: ProjectTypeListPage;
  let fixture: ComponentFixture<ProjectTypeListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTypeListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTypeListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
