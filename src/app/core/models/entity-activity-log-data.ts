import { Observable } from "rxjs";
import { ApiResponse } from "./api-response";
import { ListRequestParams } from "./list-request-params";
import { ActivityLog } from "./activity-log";

export interface EntityActivityLogData {
  entityId: number;
  loadLogs: (id: number, params?: ListRequestParams) => Observable<ApiResponse<ActivityLog[]>>;
}
