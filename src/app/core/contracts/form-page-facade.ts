import { KeyValue } from '@angular/common';
import { Signal } from '@angular/core';
import { BaseEntity } from '../models/base-entity';
import { ApiMetaType } from '../types/api-meta-type';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { ActivityLog } from '../models/activity-log';
export interface FormPageFacade<T extends BaseEntity> {
    entity: Signal<T | null>;
    meta: Signal<ApiMetaType | null>;
    warnings: Signal<string[]>;
    hasWarnings: Signal<boolean>;
    hasServerErrors: Signal<boolean>;
    serverErrors: Signal<KeyValue<string, string>[]>;
    hasActivityLogsMethod: Signal<boolean>;
    loadLogs(): Observable<ApiResponse<ActivityLog[]>> | null;
}
