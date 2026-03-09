import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response';
import { RoleRequestData } from '../models/role-request-data';
import { Role } from '../models/role';
import { CrudService } from '../../../../core/contracts/crud-service';
import { ListRequestParams } from '../../../../core/models/list-request-params';

@Injectable({
  providedIn: 'root',
})
export class RoleService implements CrudService<Role> {
  private readonly baseUrl: string = environment.baseUrlApi + '/security/roles';
  
  private http = inject(HttpClient)

  list(params?: ListRequestParams<Role>): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}`, { withCredentials: true });
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
}
