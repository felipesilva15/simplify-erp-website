import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CrudService } from '../../../../core/contracts/crud-service';
import { ApiResponse } from '../../../../core/models/api-response';
import { ListRequestParams } from '../../../../core/models/list-request-params';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { LookupService } from '../../../../core/contracts/lookup-service';
import { LookupFilter } from '../../../../core/models/lookup-filter';
import { LookupItem } from '../../../../core/models/lookup-item';
import { LogableService } from '../../../../core/contracts/logable-service';
import { ActivityLog } from '../../../../core/models/activity-log';
import { ExportableService } from '../../../../core/contracts/exportable-service';
import { ExportRequestParams } from '../../../../core/models/export-request-params';
import { ProjectType } from '../models/project-type';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeService implements CrudService<ProjectType>, LookupService, LogableService, ExportableService {
  private readonly baseUrl: string = environment.baseUrlApi + '/construction/project-types';

  private http: HttpClient = inject(HttpClient)
  private queryBuilder: HttpQueryBuilderService = inject(HttpQueryBuilderService)

  list(params?: ListRequestParams): Observable<ApiResponse<ProjectType[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<ProjectType[]>>(`${this.baseUrl}`, { withCredentials: true, params: httpParams });
  }

  get(id: number): Observable<ApiResponse<ProjectType>> {
    return this.http.get<ApiResponse<ProjectType>>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  edit(id: number): Observable<ApiResponse<ProjectType>> {
    return this.http.get<ApiResponse<ProjectType>>(`${this.baseUrl}/${id}/edit`, { withCredentials: true });
  }

  create(payload: Partial<ProjectType>): Observable<ApiResponse<ProjectType>> {
    return this.http.post<ApiResponse<ProjectType>>(`${this.baseUrl}`, payload, { withCredentials: true });
  }

  update(id: number, payload: Partial<ProjectType>): Observable<ApiResponse<ProjectType>> {
    return this.http.put<ApiResponse<ProjectType>>(`${this.baseUrl}/${id}`, payload, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  search(params: LookupFilter): Observable<ApiResponse<LookupItem[]>> | Promise<ApiResponse<LookupItem[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.baseUrl}/lookup`, { withCredentials: true, params: httpParams });
  }

  activityLogs(id: number, params?: ListRequestParams): Observable<ApiResponse<ActivityLog[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<ActivityLog[]>>(`${this.baseUrl}/${id}/activity-logs`, { withCredentials: true, params: httpParams });
  }

  export(params: ExportRequestParams): Observable<Blob> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get(`${this.baseUrl}/export`, { withCredentials: true, params: httpParams, responseType: 'blob' });
  }
}
