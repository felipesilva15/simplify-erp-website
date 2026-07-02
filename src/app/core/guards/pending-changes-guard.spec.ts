import { Mocked } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { pendingChangesGuard } from './pending-changes-guard';
import { Component } from '@angular/core';
import { CrudFormFacade } from '../../shared/facades/crud-form.facade';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormMode } from '../enums/form-mode';
import { ApiResponse } from '../models/api-response';

@Component({template: '<h1>Form page</h1>'})
class ComponentWithFacade {
  facade!: { canDeactivate: ReturnType<typeof vi.fn> };
}

@Component({template: '<h1>Form page</h1>'})
class ComponentWithoutFacade { }

describe('pendingChangesGuard', () => {
  let componentWithFacade: Mocked<ComponentWithFacade>;
  let componentWithoutFacade: Mocked<ComponentWithoutFacade>;

  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pendingChangesGuard(...guardParameters));

  beforeEach(() => {
    componentWithFacade = {
      facade: {
        canDeactivate: vi.fn(),
      }
    } as unknown as Mocked<ComponentWithFacade>
    componentWithoutFacade = { } as unknown as Mocked<ComponentWithFacade>

    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return the result from facade.canDeactivate', async () => {
    componentWithFacade.facade.canDeactivate.mockReturnValue(true)
    let result;

    result = await executeGuard(componentWithFacade, {} as any, {} as any, {} as any);

    expect(componentWithFacade.facade.canDeactivate).toHaveBeenCalled();
    expect(result).toBe(true);

    componentWithFacade.facade.canDeactivate.mockReturnValue(false)

    result = await executeGuard(componentWithFacade, {} as any, {} as any, {} as any);

    expect(componentWithFacade.facade.canDeactivate).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should always return true from component without facade', async () => {
    const result = await executeGuard(componentWithoutFacade, {} as any, {} as any, {} as any);

    expect(result).toBe(true);
  });
});
