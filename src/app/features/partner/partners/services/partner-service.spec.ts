import { HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../../environments/environment';
import { HttpQueryBuilderService } from '../../../../core/services/http-query-builder-service';
import { LookupFilter } from '../../../../core/models/lookup-filter';
import { LookupItem } from '../../../../core/models/lookup-item';
import { ApiResponse } from '../../../../core/models/api-response';
import { ListRequestParams } from '../../../../core/models/list-request-params';
import { FilterOperator } from '../../../../core/enums/filter-operator';
import { ExportExtension } from '../../../../core/enums/export-extension';
import { ExportFormat } from '../../../../core/enums/export-format';
import { PersonType } from '../enums/person-type';
import { TaxpayerType } from '../enums/taxpayer-type';
import { Partner } from '../models/partner';
import { PartnerRequestData } from '../models/partner-request-data';
import { PartnerService } from './partner-service';

describe('PartnerService', () => {
  let service: PartnerService;
  let httpMock: HttpTestingController;
  let queryBuilder: { buildHttpParams: ReturnType<typeof vi.fn> };

  const baseUrl = `${environment.baseUrlApi}/partner/partners`;

  const partner: Partner = {
    id: 1,
    name: 'Felipe Silva',
    trade_name: 'Felipe MEI',
    partner_type_code: 'C',
    person_type: PersonType.Person,
    taxpayer_type: TaxpayerType.Taxpayer,
    document_number: '12345678901',
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

    service = TestBed.inject(PartnerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should export partners to the /export route with params, credentials and blob response', () => {
    const params: ListRequestParams = {
      filters: { name: { [FilterOperator.Like]: 'Felipe' } },
      sorts: 'name',
      per_page: 20,
      page: 1,
    };
    const httpParams = new HttpParams().set('page', '1');
    const blob = new Blob(['exported-data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    queryBuilder.buildHttpParams.mockReturnValue(httpParams);

    service
      .export({ ...params, format: ExportFormat.Completo, extension: ExportExtension.Xlsx })
      .subscribe(result => {
        expect(result).toEqual(blob);
      });

    const req = httpMock.expectOne(request => request.url === `${baseUrl}/export`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.responseType).toBe('blob');
    expect(req.request.params).toBe(httpParams);
    expect(queryBuilder.buildHttpParams).toHaveBeenCalledWith({
      filters: { name: { [FilterOperator.Like]: 'Felipe' } },
      sorts: 'name',
      per_page: 20,
      page: 1,
      format: ExportFormat.Completo,
      extension: ExportExtension.Xlsx,
    });

    req.flush(blob);
  });

  it('should list partners with query params and credentials', () => {
    const params: ListRequestParams = {
      filters: { name: { [FilterOperator.Like]: 'Felipe' } },
      sorts: 'name',
      per_page: 15,
      page: 2,
    };
    const httpParams = new HttpParams().set('page', '2');
    const response: ApiResponse<Partner[]> = {
      success: true,
      message: 'Partners listed',
      data: [partner],
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

  it('should get a partner by id with credentials', () => {
    const response: ApiResponse<Partner> = {
      success: true,
      message: 'Partner found',
      data: partner,
    };

    service.get(1).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);
  });

  it('should get a partner edit payload by id with credentials', () => {
    const response: ApiResponse<Partner> = {
      success: true,
      message: 'Partner ready to edit',
      data: partner,
    };

    service.edit(1).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/edit`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);
  });

  it('should create a partner with credentials', () => {
    const payload = {
      name: 'Felipe Silva',
      trade_name: 'Felipe MEI',
      partner_type_code: 'C',
      person_type: PersonType.Person,
      taxpayer_type: TaxpayerType.Taxpayer,
      document_number: '12345678901',
    };
    const response: ApiResponse<Partner> = {
      success: true,
      message: 'Partner created',
      data: partner,
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

  it('should update a partner with credentials', () => {
    const payload: PartnerRequestData = {
      name: 'Felipe Silva Atualizado',
      trade_name: 'Felipe MEI',
      partner_type_code: 'C',
      person_type: PersonType.Person,
      taxpayer_type: TaxpayerType.Taxpayer,
      document_number: '12345678901',
    };
    const response: ApiResponse<Partner> = {
      success: true,
      message: 'Partner updated',
      data: { ...partner, ...payload },
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

  it('should delete a partner with credentials', () => {
    service.delete(1).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);

    req.flush(null);
  });

  it('should search partners through the lookup route with credentials', () => {
    const filter: LookupFilter = { q: 'Felipe' };
    const httpParams = new HttpParams().set('q', 'Felipe');
    const response: ApiResponse<{ id: number; label: string }[]> = {
      success: true,
      message: 'Lookup results',
      data: [{ id: 1, label: 'Felipe Silva' }],
    };

    queryBuilder.buildHttpParams.mockReturnValue(httpParams);

    (service.search(filter) as Observable<ApiResponse<LookupItem[]>>).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(request => request.url === `${baseUrl}/lookup`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params).toBe(httpParams);

    req.flush(response);
  });
});