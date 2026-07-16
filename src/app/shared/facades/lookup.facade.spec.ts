import { firstValueFrom, of } from 'rxjs';
import { LookupFacade } from './lookup.facade';
import { Mocked } from 'vitest';
import { LookupService } from '../../core/contracts/lookup-service';
import { LookupFilter } from '../../core/models/lookup-filter';
import { LookupItem } from '../../core/models/lookup-item';
import { ApiResponse } from '../../core/models/api-response';
import { ApiMetaOption } from '../../core/enums/api-meta-option';

describe('LookupFacade', () => {
  let facade: LookupFacade;
  let mockLookupService: Mocked<LookupService>;

  beforeEach(() => {
    mockLookupService = {
      search: vi.fn(),
    } as unknown as Mocked<LookupService>;

    facade = new LookupFacade(mockLookupService);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should update the internal service and use it for subsequent searches', async () => {
    const newService = {
      search: vi.fn().mockReturnValue(
        of({
          success: true,
          message: 'Success',
          data: [{ key: 'new-key', label: 'New Label' }],
        })
      ),
    } as unknown as Mocked<LookupService>;

    facade.setService(newService);

    const filter: LookupFilter = { q: 'test' };
    const result = await firstValueFrom(facade.search(filter));

    expect(newService.search).toHaveBeenCalledWith(filter);
    expect(mockLookupService.search).not.toHaveBeenCalled();
    expect(result.items).toEqual([{ key: 'new-key', label: 'New Label' }]);
  });

  it('should return empty result if service is not defined', async () => {
    // Set service to null
    facade.setService(null as any);

    const filter: LookupFilter = { q: 'test' };
    const result = await firstValueFrom(facade.search(filter));

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 0,
    }); 
  });

  it('should normalize successful response with full data and metadata', async () => {
    const mockItems: LookupItem[] = [
      { key: 1, label: 'Option 1' },
      { key: 2, label: 'Option 2' },
    ];
    const apiResponse: ApiResponse<LookupItem[]> = {
      success: true,
      message: 'Found results',
      data: mockItems,
      meta: {
        [ApiMetaOption.Total]: 100,
        [ApiMetaOption.CurrentPage]: 3,
        [ApiMetaOption.PerPage]: 10,
        [ApiMetaOption.Editable]: false,
        [ApiMetaOption.LastPage]: 10,
      },
    };

    mockLookupService.search.mockReturnValue(of(apiResponse));

    const filter: LookupFilter = { q: 'test' };
    const result = await firstValueFrom(facade.search(filter));

    expect(mockLookupService.search).toHaveBeenCalledWith(filter);
    expect(result).toEqual({
      items: mockItems,
      total: 100,
      page: 3,
      perPage: 10,
    });
  });

  it('should fallback to default values in normalization when metadata or data is missing', async () => {
    const apiResponse: ApiResponse<LookupItem[]> = {
      success: true,
      message: 'Found results',
      data: null as any, // Missing data
      meta: undefined,   // Missing metadata
    };

    mockLookupService.search.mockReturnValue(of(apiResponse));

    const filter: LookupFilter = { q: 'test' };
    const result = await firstValueFrom(facade.search(filter));

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 0,
    });
  });

  it('should return empty result if api response success is false', async () => {
    const apiResponse: ApiResponse<LookupItem[]> = {
      success: false,
      message: 'Failed to search',
      data: [{ key: 1, label: 'Option 1' }],
    };

    mockLookupService.search.mockReturnValue(of(apiResponse));

    const filter: LookupFilter = { q: 'test' };
    const result = await firstValueFrom(facade.search(filter));

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 0,
    });
  });

  it('should handle and normalize promise resolution correctly', async () => {
    const mockItems: LookupItem[] = [{ key: 'abc', label: 'Item ABC' }];
    const apiResponse: ApiResponse<LookupItem[]> = {
      success: true,
      message: 'Resolved promise',
      data: mockItems,
      meta: {
        [ApiMetaOption.Total]: 5,
        [ApiMetaOption.CurrentPage]: 1,
        [ApiMetaOption.PerPage]: 5,
        [ApiMetaOption.Editable]: false,
        [ApiMetaOption.LastPage]: 1,
      },
    };

    mockLookupService.search.mockReturnValue(Promise.resolve(apiResponse) as any);

    const filter: LookupFilter = { q: 'promise' };
    const result = await firstValueFrom(facade.search(filter));

    expect(mockLookupService.search).toHaveBeenCalledWith(filter);
    expect(result).toEqual({
      items: mockItems,
      total: 5,
      page: 1,
      perPage: 5,
    });
  });
});
