import { CrudFormFacade } from './crud-form.facade';
import { CrudService } from '../../core/contracts/crud-service';
import { CrudFormConfig } from '../../core/models/crud-form-config';
import { FormGroup } from '@angular/forms';
import { ApiResponse } from '../../core/models/api-response';
import { BaseEntity } from '../../core/models/base-entity';
import { Observable } from 'rxjs';

export class GenericCrudFormFacade<T extends BaseEntity> extends CrudFormFacade<T> {
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
        form.patchValue(data);
    }

    protected override buildPayload(form: FormGroup): Partial<T> {
        let payload = form.getRawValue();
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