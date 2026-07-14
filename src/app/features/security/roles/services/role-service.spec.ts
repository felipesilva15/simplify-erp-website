import { TestBed } from '@angular/core/testing';

import { RoleService } from './role-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { Role } from '../models/role';
import { HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { ListRequestParams } from '../../../../core/models/list-request-params';
import { FilterOperator } from '../../../../core/enums/filter-operator';
import { ApiResponse } from '../../../../core/models/api-response';
import { RoleRequestData } from '../models/role-request-data';
import { LookupFilter } from '../../../../core/models/lookup-filter';
import { LookupItem } from '../../../../core/models/lookup-item';
import { of } from 'rxjs';

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;
  let queryBuilder: { buildHttpParams: ReturnType<typeof vi.fn> };

  const baseUrl = `${environment.baseUrlApi}/security/roles`;
  const now = new Date('2026-01-01T00:00:00.000Z');
  const role: Role = {
    id: 1,
    name: 'Financeiro',
    description: 'Uma breve descrição',
    permissions: [],
    created_at: now,
    updated_at: now,
  };

  beforeEach(() => {
    queryBuilder = {
      buildHttpParams: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HttpQueryBuilderService, useValue: queryBuilder },
      ],
    });

    service = TestBed.inject(RoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list roles with query params and credentials', () => {
    const params: ListRequestParams = {
      filters: { name: { [FilterOperator.Like]: 'Jane' } },
      sorts: 'name',
      per_page: 15,
      page: 2,
    };
    const httpParams = new HttpParams().set('page', '2');
    const response: ApiResponse<Role[]> = {
      success: true,
      message: 'Roles listed',
      data: [role],
    };

    queryBuilder.buildHttpParams.mockReturnValue(httpParams);

    service.list(params).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(request => request.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params).toBe(httpParams);
    expect(queryBuilder.buildHttpParams).toHaveBeenCalledWith(params);

    req.flush(response);
  });

  it('should list roles without params', () => {
    const httpParams = new HttpParams();
    const response: ApiResponse<Role[]> = {
      success: true,
      message: 'Roles listed',
      data: [],
    };

    queryBuilder.buildHttpParams.mockReturnValue(httpParams);

    service.list().subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(request => request.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params).toBe(httpParams);
    expect(queryBuilder.buildHttpParams).toHaveBeenCalledWith(undefined);

    req.flush(response);
  });

  it('should get a role by id with credentials', () => {
    const response: ApiResponse<Role> = {
      success: true,
      message: 'Role found',
      data: role,
    };

    service.get(1).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);
  });

  it('should get a role edit payload by id with credentials', () => {
    const response: ApiResponse<Role> = {
      success: true,
      message: 'Role ready to edit',
      data: role,
    };

    service.edit(1).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/edit`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);
  });

  it('should create a role with credentials', () => {
    const payload: RoleRequestData = {
      name: 'Financeiro',
      description: 'Descrição breve.',
    };
    const response: ApiResponse<Role> = {
      success: true,
      message: 'Role created',
      data: role,
    };

    service.create(payload).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);

    req.flush(response);
  });

  it('should update a role with credentials', () => {
    const payload: RoleRequestData = {
      name: 'Comercial',
      description: 'Descrição breve.',
    };
    const response: ApiResponse<Role> = {
      success: true,
      message: 'Role updated',
      data: { ...role, ...payload },
    };

    service.update(1, payload).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);

    req.flush(response);
  });

  it('should delete a role with credentials', () => {
    service.delete(1).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);

    req.flush(null);
  });

  it('should lookup roles', () => {
    const filter: LookupFilter = { q: 'Financeiro' };

    expect(() => service.search(filter)).toThrow('Method not implemented.');
    expect(queryBuilder.buildHttpParams).not.toHaveBeenCalled();

    const httpParams = new HttpParams();
    const response: ApiResponse<LookupItem[]> = {
      success: true,
      message: 'Roles listed',
      data: [],
    };

    queryBuilder.buildHttpParams.mockReturnValue(httpParams);

    of(service.search(filter)).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${baseUrl}/lookup`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params).toBe(httpParams);
    expect(queryBuilder.buildHttpParams).toHaveBeenCalledWith(filter);

    req.flush(response);
  });
});
