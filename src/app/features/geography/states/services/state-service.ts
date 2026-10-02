import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CrudService } from '../../../../core/contracts/crud-service';
import { ExportableService } from '../../../../core/contracts/exportable-service';
import { LookupService } from '../../../../core/contracts/lookup-service';
import { ApiResponse } from '../../../../core/models/api-response';
import { ExportRequestParams } from '../../../../core/models/export-request-params';
import { ListRequestParams } from '../../../../core/models/list-request-params';
import { LookupFilter } from '../../../../core/models/lookup-filter';
import { LookupItem } from '../../../../core/models/lookup-item';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { State } from '../models/state';

@Injectable({
  providedIn: 'root',
})
export class StateService implements CrudService<State>, LookupService, ExportableService {
  private readonly baseUrl: string = environment.baseUrlApi + '/geography/states';
  
  private http: HttpClient = inject(HttpClient)
  private queryBuilder: HttpQueryBuilderService = inject(HttpQueryBuilderService)

  list(params?: ListRequestParams): Observable<ApiResponse<State[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<State[]>>(`${this.baseUrl}`, { withCredentials: true, params: httpParams });
  }

  get(id: number): Observable<ApiResponse<State>> {
    return this.http.get<ApiResponse<State>>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  search(params: LookupFilter): Observable<ApiResponse<LookupItem[]>> | Promise<ApiResponse<LookupItem[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.baseUrl}/lookup`, { withCredentials: true, params: httpParams });
  }
  
  export(params: ExportRequestParams): Observable<Blob> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get(`${this.baseUrl}/export`, { withCredentials: true, params: httpParams, responseType: 'blob' });
  }

  edit(id: number): Observable<ApiResponse<State>> {
    throw new Error('Method not implemented.');
  }

  create(payload: Partial<State>): Observable<ApiResponse<State>> {
    throw new Error('Method not implemented.');
  }

  update(id: number, payload: Partial<State>): Observable<ApiResponse<State>> {
    throw new Error('Method not implemented.');
  }
  
  delete(id: number): Observable<void> {
    throw new Error('Method not implemented.');
  }
}
