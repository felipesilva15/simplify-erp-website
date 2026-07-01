import { HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../../environments/environment';
import { FilterOperator } from '../../../../core/enums/filter-operator';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { LookupFilter } from '../../../../core/models/lookup-filter';
import { ApiResponse } from '../../../../core/models/api-response';
import { ListRequestParams } from '../../../../core/models/list-request-params';
import { User } from '../models/user';
import { UserService } from './user-service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let queryBuilder: { buildHttpParams: ReturnType<typeof vi.fn> };

  const baseUrl = `${environment.baseUrlApi}/security/users`;
  const now = new Date('2026-01-01T00:00:00.000Z');
  const user: User = {
    id: 1,
    name: 'Jane Doe',
    username: 'jane.doe',
    email: 'jane@example.com',
    phone_number: '+5511999999999',
    is_admin: false,
    permissions: ['users.view'],
    roles: [],
    avatar_url: 'https://example.com/avatar.png',
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

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list users with query params and credentials', () => {
    const params: ListRequestParams = {
      filters: { name: { [FilterOperator.Like]: 'Jane' } },
      sorts: 'name',
      per_page: 15,
      page: 2,
    };
    const httpParams = new HttpParams().set('page', '2');
    const response: ApiResponse<User[]> = {
      success: true,
      message: 'Users listed',
      data: [user],
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

  it('should list users without params', () => {
    const httpParams = new HttpParams();
    const response: ApiResponse<User[]> = {
      success: true,
      message: 'Users listed',
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

  it('should get a user by id with credentials', () => {
    const response: ApiResponse<User> = {
      success: true,
      message: 'User found',
      data: user,
    };

    service.get(1).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);
  });

  it('should get a user edit payload by id with credentials', () => {
    const response: ApiResponse<User> = {
      success: true,
      message: 'User ready to edit',
      data: user,
    };

    service.edit(1).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/edit`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);
  });

  it('should create a user with credentials', () => {
    const payload: Partial<User> = {
      name: 'Jane Doe',
      username: 'jane.doe',
      email: 'jane@example.com',
      phone_number: '+5511999999999',
      is_admin: false,
    };
    const response: ApiResponse<User> = {
      success: true,
      message: 'User created',
      data: user,
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

  it('should update a user with credentials', () => {
    const payload: Partial<User> = {
      name: 'Jane Updated',
      username: 'jane.updated',
    };
    const response: ApiResponse<User> = {
      success: true,
      message: 'User updated',
      data: { ...user, ...payload },
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

  it('should delete a user with credentials', () => {
    service.delete(1).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);

    req.flush(null);
  });

  it('should throw because search is not implemented', () => {
    const filter: LookupFilter = { q: 'Jane' };

    expect(() => service.search(filter)).toThrow('Method not implemented.');
    expect(queryBuilder.buildHttpParams).not.toHaveBeenCalled();
  });
});
