import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response';
import { ListRequestParams } from '../../../../core/models/list-request-params';
import { LookupFilter } from '../../../../core/models/lookup-filter';
import { LookupItem } from '../../../../core/models/lookup-item';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { Partner } from '../models/partner';
import { PartnerRequestData } from '../models/partner-request-data';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private readonly baseUrl: string = environment.baseUrlApi + '/partner/partners';
  
  private http: HttpClient = inject(HttpClient)
  private queryBuilder: HttpQueryBuilderService = inject(HttpQueryBuilderService)

  list(params?: ListRequestParams): Observable<ApiResponse<Partner[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<Partner[]>>(`${this.baseUrl}`, { withCredentials: true, params: httpParams });
  }

  get(id: number): Observable<ApiResponse<Partner>> {
    return this.http.get<ApiResponse<Partner>>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
  
  edit(id: number): Observable<ApiResponse<Partner>> {
    return this.http.get<ApiResponse<Partner>>(`${this.baseUrl}/${id}/edit`, { withCredentials: true });
  }

  create(data: PartnerRequestData): Observable<ApiResponse<Partner>> {
    return this.http.post<ApiResponse<Partner>>(`${this.baseUrl}`, data, { withCredentials: true });
  }

  update(id: number, data: PartnerRequestData): Observable<ApiResponse<Partner>> {
    return this.http.put<ApiResponse<Partner>>(`${this.baseUrl}/${id}`, data, { withCredentials: true });
  }

  definePermissions(id: number, data: { ids: number[] }): Observable<ApiResponse<Partner>> {
    return this.http.patch<ApiResponse<Partner>>(`${this.baseUrl}/${id}/permissions`, data, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  search(params: LookupFilter): Observable<ApiResponse<LookupItem[]>> | Promise<ApiResponse<LookupItem[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/lookup`, { withCredentials: true, params: httpParams });
  }
}
