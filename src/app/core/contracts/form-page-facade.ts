import { KeyValue } from '@angular/common';
import { Signal } from '@angular/core';
import { BaseEntity } from '../models/base-entity';
import { ApiResponse } from '../models/api-response';
export interface FormPageFacade<T extends BaseEntity> {
    entity: Signal<T | null>;
    entityResponse: Signal<ApiResponse<T> | null>
    hasWarnings: Signal<boolean>;
    hasServerErrors: Signal<boolean>;
    serverErrors: Signal<KeyValue<string, string>[]>;
}
