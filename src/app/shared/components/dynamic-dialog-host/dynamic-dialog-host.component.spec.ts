import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Router, Routes, provideRouter, RouterOutlet } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogService } from '../../services/dynamic-dialog-service';
import { DynamicDialogHostComponent } from './dynamic-dialog-host.component';
import { vi } from 'vitest';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
class RootComponent {}

@Component({
  selector: 'app-host-list',
  imports: [RouterOutlet],
  template: `<p>list</p><router-outlet />`,
})
class HostListComponent {}

@Component({ selector: 'app-fake-dialog', template: `dialog` })
class FakeDialogComponent {}

const FAKE_DIALOG_ROUTE = {
  data: { dialog: { component: FakeDialogComponent, config: {} } },
  component: DynamicDialogHostComponent,
} as const;

describe('DynamicDialogHostComponent', () => {
  let openMock: ReturnType<typeof vi.fn>;
  let router: Router;
  let fixture: ComponentFixture<RootComponent>;

  beforeEach(async () => {
    openMock = vi.fn();

    const routes: Routes = [
      { path: '', component: RootComponent },
      {
        path: 'partner/partner-types',
        component: HostListComponent,
        children: [
          { path: 'new', ...FAKE_DIALOG_ROUTE },
          { path: ':id/edit', ...FAKE_DIALOG_ROUTE },
          { path: ':id', ...FAKE_DIALOG_ROUTE },
        ],
      },
    ];

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: DialogService, useValue: {} },
        {
          provide: DynamicDialogService,
          useValue: { open: openMock, close: vi.fn() },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(RootComponent);
  });

  async function open(url: string): Promise<void> {
    openMock.mockResolvedValue(undefined);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    // agenda: open().then -> onClosed -> navigateBack
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  }

  it('should resolve service.open with the route params in config.data', async () => {
    await open('/partner/partner-types/7/edit');

    expect(openMock).toHaveBeenCalledTimes(1);
    const [, config] = openMock.mock.calls[0];
    expect(config.data).toEqual({ id: '7' });
  });

  it('should go back to the list after closing from /new', async () => {
    await open('/partner/partner-types/new');

    expect(router.url).toBe('/partner/partner-types');
  });

  it('should go back to the list after closing from /:id', async () => {
    await open('/partner/partner-types/5');

    expect(router.url).toBe('/partner/partner-types');
  });

  it('should go back to the list after closing from /:id/edit (not to /:id)', async () => {
    await open('/partner/partner-types/5/edit');

    expect(router.url).toBe('/partner/partner-types');
    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it('should not navigate back when the route was already abandoned (destroyed)', async () => {
    let resolveOpen: (value?: unknown) => void = () => undefined;
    openMock.mockReturnValue(
      new Promise((resolve) => {
        resolveOpen = resolve;
      })
    );

    await router.navigateByUrl('/partner/partner-types/5/edit');
    fixture.detectChanges();

    // rota abandonada antes do dialog fechar (ex.: location.back / navegação externa)
    await router.navigateByUrl('/partner/partner-types');
    fixture.detectChanges();

    resolveOpen();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(router.url).toBe('/partner/partner-types');
  });
});