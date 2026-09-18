import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AccordionModule } from 'primeng/accordion';
import { TimelineModule } from 'primeng/timeline';
import { Message } from 'primeng/message';
import { DRAWER_CONFIG, DRAWER_REF } from '../../../core/models/drawer-tokens';
import { DrawerConfig } from '../../../core/models/drawer-config';
import { EntityActivityLogData } from '../../../core/models/entity-activity-log-data';
import { ActivityLog } from '../../../core/models/activity-log';
import { ActivityLogAction } from '../../../core/enums/activity-log-action';

interface ActivityLogGroup {
  key: string;
  label: string;
  logs: ActivityLog[];
}

@Component({
  selector: 'app-entity-activity-log-list',
  imports: [AccordionModule, TimelineModule, Message, DatePipe],
  templateUrl: './entity-activity-log-list.drawer.html',
  styleUrl: './entity-activity-log-list.drawer.scss',
})
export class EntityActivityLogListDrawer implements OnInit, OnDestroy {
  private drawerRef = inject(DRAWER_REF, { optional: true });
  private drawerConfig = inject<DrawerConfig<EntityActivityLogData>>(DRAWER_CONFIG, { optional: true });
  private destroy$ = new Subject<void>();

  private logs = signal<ActivityLog[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  groupedLogs = computed<ActivityLogGroup[]>(() => this.groupLogs(this.logs()));

  /** Expande por padrão apenas o grupo mais recente (Hoje). */
  expandedKeys = computed<string[]>(() => {
    const first = this.groupedLogs()[0];
    return first ? [first.key] : [];
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  markerIconFor(action: ActivityLogAction): string {
    switch (action) {
      case ActivityLogAction.Created:
        return 'pi pi-plus';
      case ActivityLogAction.Updated:
        return 'pi pi-pencil';
      case ActivityLogAction.Deleted:
        return 'pi pi-trash';
      case ActivityLogAction.Approved:
        return 'pi pi-check-circle';
      case ActivityLogAction.Auth:
        return 'pi pi-key';
      default:
        return 'pi pi-clock';
    }
  }

  close(): void {
    this.drawerRef?.close();
  }

  private loadLogs(): void {
    const data = this.drawerConfig?.data;
    if (!data || typeof data.loadLogs !== 'function') {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    data.loadLogs(data.entityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.logs.set(response.data),
        error: () => {
          this.error.set('Erro ao carregar os logs de alteração.');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private groupLogs(logs: ActivityLog[]): ActivityLogGroup[] {
    const today = this.startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const groups = new Map<string, ActivityLog[]>();
    const sorted = [...logs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    for (const log of sorted) {
      const key = this.dateKey(this.startOfDay(new Date(log.created_at)));
      const group = groups.get(key);
      if (group) {
        group.push(log);
      } else {
        groups.set(key, [log]);
      }
    }

    return [...groups.entries()].map(([key, groupLogs]) => ({
      key,
      label: this.groupLabel(key, today, yesterday),
      logs: groupLogs,
    }));
  }

  private groupLabel(key: string, today: Date, yesterday: Date): string {
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (date.getTime() === today.getTime()) {
      return 'Hoje';
    }

    if (date.getTime() === yesterday.getTime()) {
      return 'Ontem';
    }

    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }
}