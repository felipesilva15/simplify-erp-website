import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { EntityActivityLogListDrawer } from './entity-activity-log-list.drawer';
import { DRAWER_CONFIG, DRAWER_REF } from '../../../core/models/drawer-tokens';
import { DrawerRef } from '../../../core/lib/drawer-ref';
import { EntityActivityLogData } from '../../../core/models/entity-activity-log-data';
import { ActivityLog } from '../../../core/models/activity-log';
import { ActivityLogAction } from '../../../core/enums/activity-log-action';

function makeLog(createdAt: Date, action: ActivityLogAction = ActivityLogAction.Updated): ActivityLog {
  return {
    id: 1,
    origin_type: 'Test',
    origin_id: '1',
    action,
    action_label: 'Atualizado',
    created_at: createdAt,
  };
}

describe('EntityActivityLogListDrawer', () => {
  let component: EntityActivityLogListDrawer;
  let fixture: ComponentFixture<EntityActivityLogListDrawer>;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  beforeEach(async () => {
    const loadLogs = vi.fn((_id: number) =>
      of({
        success: true,
        message: '',
        data: [makeLog(today), makeLog(yesterday, ActivityLogAction.Created)],
      })
    );

    await TestBed.configureTestingModule({
      imports: [EntityActivityLogListDrawer],
      providers: [
        { provide: DRAWER_REF, useValue: new DrawerRef() },
        {
          provide: DRAWER_CONFIG,
          useValue: { data: { entityId: 1, loadLogs } satisfies EntityActivityLogData },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityActivityLogListDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load logs and group by day with friendly labels (Hoje/Ontem)', () => {
    fixture.detectChanges();

    const headers = fixture.debugElement.queryAll(By.css('.p-accordionheader'));
    const headerTexts = headers.map((header) => header.nativeElement.textContent.trim());

    expect(headerTexts.length).toBe(2);
    expect(headerTexts[0]).toContain('Hoje');
    expect(headerTexts[1]).toContain('Ontem');
  });
});