import { TestBed } from '@angular/core/testing';

import { DynamicDrawerService } from './dynamic-drawer-service';
import { Position } from '../../core/enums/position';

describe('DynamicDrawerService', () => {
  let service: DynamicDrawerService;
  let clock: { tick: (ms: number) => void };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicDrawerService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should add a drawer to the stack', () => {
      const ref = service.open(class HostComponent {}, { position: Position.Left });

      expect(service.drawers()).toHaveLength(1);
      expect(service.drawers()[0].ref).toBe(ref);
    });

    it('should create an instance with visible true', () => {
      service.open(class HostComponent {}, {});

      expect(service.drawers()[0].visible()).toBe(true);
    });

    it('should assign incremental zIndex based on stack level', () => {
      service.open(class HostComponent {}, {});
      service.open(class HostComponent {}, {});

      expect(service.drawers()[0].zIndex).toBe(20000);
      expect(service.drawers()[1].zIndex).toBe(20010);
    });

    it('should respect baseZIndex config', () => {
      service.open(class HostComponent {}, { baseZIndex: 30000 });

      expect(service.drawers()[0].zIndex).toBe(30000);
    });
  });

  describe('close', () => {
    it('should not remove a drawer immediately on close', () => {
      const ref = service.open(class HostComponent {}, {});

      ref.close();

      expect(service.drawers()).toHaveLength(1);
    });

    it('should set visible to false on close', () => {
      const ref = service.open(class HostComponent {}, {});

      ref.close();

      expect(service.drawers()[0].visible()).toBe(false);
    });

    it('should remove the drawer after the leave animation completes', () => {
      vi.useFakeTimers();
      const ref = service.open(class HostComponent {}, {});

      ref.close();

      vi.advanceTimersByTime(799);
      expect(service.drawers()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.drawers()).toHaveLength(0);
    });

    it('should only remove the closed drawer, keeping the others', () => {
      vi.useFakeTimers();
      const first = service.open(class HostComponent {}, {});
      service.open(class HostComponent {}, {});

      first.close();

      vi.advanceTimersByTime(800);
      expect(service.drawers()).toHaveLength(1);
    });
  });
});