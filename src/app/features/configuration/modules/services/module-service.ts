import { inject, Injectable } from '@angular/core';
import { Module } from '../models/module';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { ApiResponse } from '../../../../core/models/api-response';
import { Observable } from 'rxjs';
import { ListRequestParams } from '../../../../core/models/list-request-params';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private readonly baseUrl: string = environment.baseUrlApi + '/core/modules';
  
  private http: HttpClient = inject(HttpClient)
  private queryBuilder: HttpQueryBuilderService = inject(HttpQueryBuilderService)

  list(params?: ListRequestParams): Observable<ApiResponse<Module[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<Module[]>>(`${this.baseUrl}`, { withCredentials: true, params: httpParams });
  }

  get(id: number): Observable<ApiResponse<Module>> {
    return this.http.get<ApiResponse<Module>>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}
