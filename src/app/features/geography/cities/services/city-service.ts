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
import { City } from '../models/city';

@Injectable({
  providedIn: 'root',
})
export class CityService implements CrudService<City>, LookupService, ExportableService {
  private readonly baseUrl: string = environment.baseUrlApi + '/geography/cities';
  
  private http: HttpClient = inject(HttpClient)
  private queryBuilder: HttpQueryBuilderService = inject(HttpQueryBuilderService)

  list(params?: ListRequestParams): Observable<ApiResponse<City[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<City[]>>(`${this.baseUrl}`, { withCredentials: true, params: httpParams });
  }

  get(id: number): Observable<ApiResponse<City>> {
    return this.http.get<ApiResponse<City>>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  search(params: LookupFilter): Observable<ApiResponse<LookupItem[]>> | Promise<ApiResponse<LookupItem[]>> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.baseUrl}/lookup`, { withCredentials: true, params: httpParams });
  }
  
  export(params: ExportRequestParams): Observable<Blob> {
    const httpParams: HttpParams = this.queryBuilder.buildHttpParams(params);
    return this.http.get(`${this.baseUrl}/export`, { withCredentials: true, params: httpParams, responseType: 'blob' });
  }

  edit(id: number): Observable<ApiResponse<City>> {
    throw new Error('Method not implemented.');
  }

  create(payload: Partial<City>): Observable<ApiResponse<City>> {
    throw new Error('Method not implemented.');
  }

  update(id: number, payload: Partial<City>): Observable<ApiResponse<City>> {
    throw new Error('Method not implemented.');
  }
  
  delete(id: number): Observable<void> {
    throw new Error('Method not implemented.');
  }
}
