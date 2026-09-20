import { CrudFormFacade } from './crud-form.facade';
import { CrudService } from '../../core/contracts/crud-service';
import { CrudFormConfig } from '../../core/models/crud-form-config';
import { FormGroup } from '@angular/forms';
import { ApiResponse } from '../../core/models/api-response';
import { BaseEntity } from '../../core/models/base-entity';
import { DateUtilsService } from '../../core/services/date-utils-service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export class GenericCrudFormFacade<T extends BaseEntity> extends CrudFormFacade<T> {
    private dateUtils: DateUtilsService = inject(DateUtilsService);

    constructor(
        service: CrudService<T>,
        config?: CrudFormConfig<T>
    ) {
        super(service, config);
    }

    protected override fetchData(id: number): Observable<ApiResponse<T>> {
        return this.isView() ? this.service.get(id) : this.service.edit(id);
    }

    protected override applyLoadedData(data: T, form: FormGroup): void {
        form.patchValue(this.dateUtils.parseIsoDates(data));
    }

    protected override buildPayload(form: FormGroup): Partial<T> {
        let payload = form.getRawValue();

        Object.keys(payload).map((key) => {
            if (payload[key] instanceof Date) {
                payload[key] = this.dateUtils.formatIsoDate(payload[key] as Date);
            }
        });
        
        payload = this.unwrapLookups(payload);

        if (this.config?.beforeSubmit) {
            payload = this.config.beforeSubmit(payload);
        }

        return payload;
    }

    protected override persist(id: number | undefined, payload: Partial<T>): Observable<ApiResponse<T>> {
        return this.isCreate() ? this.service.create(payload) : this.service.update(id as number, payload);
    }
}