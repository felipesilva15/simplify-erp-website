import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response';
import { RoleRequestData } from '../models/role-request-data';
import { Role } from '../models/role';
import { CrudService } from '../../../../core/contracts/crud-service';
import { ListRequestParams } from '../../../../core/models/list-request-params';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { LookupService } from '../../../../core/contracts/lookup-service';
import { LookupFilter } from '../../../../core/models/lookup-filter';
import { LookupItem } from '../../../../core/models/lookup-item';

@Injectable({
  providedIn: 'root',
})
export class RoleService implements CrudService<Role>, LookupService {
  private readonly baseUrl: string = environment.baseUrlApi + '/security/roles';
  
  private http: HttpClient = inject(HttpClient)
  private queryBuilder: HttpQueryBuilderService = inject(HttpQueryBuilderService)

  list(params?: ListRequestParams): Observable<ApiResponse<Role[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}`, { withCredentials: true, params: httpParams });
  }

  get(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
  
  edit(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/${id}/edit`, { withCredentials: true });
  }

  create(data: RoleRequestData): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}`, data, { withCredentials: true });
  }

  update(id: number, data: RoleRequestData): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/${id}`, data, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  search(filter: LookupFilter): Observable<ApiResponse<LookupItem[]>> | Promise<ApiResponse<LookupItem[]>> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.baseUrl}`, {
        params: {
          q: filter.query,
          page: String(filter.page ?? 1),
          per_page: String(filter.pageSize ?? 10),
        },
        withCredentials: true
      })
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((c) => ({
            key: c.id,
            label: c.name,
            meta: { ...c },
          })),
        }))
      );
  }
}
