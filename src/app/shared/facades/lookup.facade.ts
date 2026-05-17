import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LookupService } from '../../core/contracts/lookup-service';
import { LookupFilter } from '../../core/models/lookup-filter';
import { LookupResult } from '../../core/models/lookup-result';
import { LookupItem } from '../../core/models/lookup-item';
import { ApiResponse } from '../../core/models/api-response';

export class LookupFacade {
    constructor(private service: LookupService) {}
        
    setService(service: LookupService): void {
        this.service = service;
    }
    
    search(filter: LookupFilter): Observable<LookupResult> {
        if (!this.service) {
            return of(this.emptyResult());
        }
    
        const result = this.service.search(filter);
        const result$ = result instanceof Promise ? from(result) : result;
    
        return result$.pipe(
            map((response) => this.normalize(response))
        );
    }
    
    private normalize(response: ApiResponse<LookupItem[]>): LookupResult {
        if (!response.success) {
            return this.emptyResult();
        }
    
        return {
            items: response.data ?? [],
            total: response.meta?.total ?? 0,
            page: response.meta?.current_page ?? 1,
            perPage: response.meta?.per_page ?? 0,
        };
    }
    
    private emptyResult(): LookupResult {
        return { 
            items: [],
            total: 0, 
            page: 1, 
            perPage: 0
        };
    }
}
