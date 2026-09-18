import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { ListRequestParams } from '../models/list-request-params';
import { ActivityLog } from '../models/activity-log';

export interface LogableService {
  activityLogs(id: number, params?: ListRequestParams): Observable<ApiResponse<ActivityLog[]>>;
}