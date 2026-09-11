import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { ListRequestParams } from '../../../../core/models/list-request-params';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response';
import { PartnerType } from '../models/partner-type';
import { PartnerTypeRequestData } from '../models/partner-type-request-data';
import { LookupFilter } from '../../../../core/models/lookup-filter';
import { LookupItem } from '../../../../core/models/lookup-item';
import { CrudService } from '../../../../core/contracts/crud-service';
import { LookupService } from '../../../../core/contracts/lookup-service';

@Injectable({
  providedIn: 'root',
})
export class PartnerTypeService implements CrudService<PartnerType>, LookupService {
  private readonly baseUrl: string = environment.baseUrlApi + '/partner/partner-types';
  
  private http: HttpClient = inject(HttpClient)
  private queryBuilder: HttpQueryBuilderService = inject(HttpQueryBuilderService)

  list(params?: ListRequestParams): Observable<ApiResponse<PartnerType[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<PartnerType[]>>(`${this.baseUrl}`, { withCredentials: true, params: httpParams });
  }

  get(id: number): Observable<ApiResponse<PartnerType>> {
    return this.http.get<ApiResponse<PartnerType>>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
  
  edit(id: number): Observable<ApiResponse<PartnerType>> {
    return this.http.get<ApiResponse<PartnerType>>(`${this.baseUrl}/${id}/edit`, { withCredentials: true });
  }

  create(data: PartnerTypeRequestData): Observable<ApiResponse<PartnerType>> {
    return this.http.post<ApiResponse<PartnerType>>(`${this.baseUrl}`, data, { withCredentials: true });
  }

  update(id: number, data: PartnerTypeRequestData): Observable<ApiResponse<PartnerType>> {
    return this.http.put<ApiResponse<PartnerType>>(`${this.baseUrl}/${id}`, data, { withCredentials: true });
  }

  definePermissions(id: number, data: { ids: number[] }): Observable<ApiResponse<PartnerType>> {
    return this.http.patch<ApiResponse<PartnerType>>(`${this.baseUrl}/${id}/permissions`, data, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  search(params: LookupFilter): Observable<ApiResponse<LookupItem[]>> | Promise<ApiResponse<LookupItem[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/lookup`, { withCredentials: true, params: httpParams });
  }
}
