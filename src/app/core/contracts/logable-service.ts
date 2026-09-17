import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { ListRequestParams } from '../models/list-request-params';
import { ActivityLog } from '../models/activity-log';

export interface LogableService {
  activityLogs(id: any, params?: ListRequestParams): Observable<ApiResponse<ActivityLog[]>> | Promise<ApiResponse<ActivityLog[]>>;
}