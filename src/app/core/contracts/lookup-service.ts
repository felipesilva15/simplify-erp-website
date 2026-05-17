import { Observable } from 'rxjs';
import { LookupFilter } from '../models/lookup-filter';
import { ApiResponse } from '../models/api-response';
import { LookupItem } from '../models/lookup-item';

export interface LookupService {
  search(filter: LookupFilter): Observable<ApiResponse<LookupItem[]>> | Promise<ApiResponse<LookupItem[]>>;
}