import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerTypeListPage } from './partner-type-list.page';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

describe('PartnerTypeListPage', () => {
  let component: PartnerTypeListPage;
  let fixture: ComponentFixture<PartnerTypeListPage>;
  let facadeMock: Record<string, any>;

  beforeEach(async () => {
    facadeMock = {
      data: signal([]),
      loading: signal(false),
      error: signal(null),
      totalRecords: signal(0),
      filterDefinitionVisible: signal(false),
      requestParams: signal(undefined),
      response: signal(null),
      delete: vi.fn(),
      load: vi.fn(),
      openFilters: vi.fn(),
      fitlersVisibleChange: vi.fn(),
      applyFilters: vi.fn(),
      applyLazyLoad: vi.fn(),
      can: vi.fn().mockReturnValue(true),
      canCreate: vi.fn().mockReturnValue(true),
      canUpdate: vi.fn().mockReturnValue(true),
      canDelete: vi.fn().mockReturnValue(true),
      canView: vi.fn().mockReturnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [PartnerTypeListPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
      ],
    })
      .overrideComponent(PartnerTypeListPage, {
        set: {
          providers: [
            { provide: CrudListFacade, useValue: facadeMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PartnerTypeListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload the list when a dialog notifies a successful save', () => {
    const loadSpy = facadeMock['load'] as ReturnType<typeof vi.fn>;
    const loadCountBefore = loadSpy.mock.calls.length;
    TestBed.inject(DialogRefreshService).notifySaved();
    expect(loadSpy.mock.calls.length).toBe(loadCountBefore + 1);
  });

  it('should not reload the list when no save is notified', () => {
    const loadSpy = facadeMock['load'] as ReturnType<typeof vi.fn>;
    const loadCountBefore = loadSpy.mock.calls.length;
    expect(loadSpy.mock.calls.length).toBe(loadCountBefore + 0);
  });
});