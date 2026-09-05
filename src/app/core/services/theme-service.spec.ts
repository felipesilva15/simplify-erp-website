import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeService } from './theme-service';

const DARK_MODE_CLASS = 'dark-mode';
const STORAGE_KEY = 'app-theme';

function createMatchMedia(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
}

describe('ThemeService', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(),
    });
  });

  beforeEach(() => {
    matchMediaMock = vi.fn().mockReturnValue(createMatchMedia(false));
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
    localStorage.clear();
    document.documentElement.classList.remove(DARK_MODE_CLASS);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    const service = new ThemeService();
    expect(service).toBeTruthy();
  });

  it('should default to light theme when nothing is stored and system prefers light', () => {
    const service = new ThemeService();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('should default to dark theme when the system prefers dark', () => {
    matchMediaMock.mockReturnValue(createMatchMedia(true));
    const service = new ThemeService();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('should apply the persisted dark theme on construction', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const service = new ThemeService();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(true);
  });

  it('should apply the persisted light theme even when the system prefers dark', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    matchMediaMock.mockReturnValue(createMatchMedia(true));
    const service = new ThemeService();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(false);
  });

  describe('toggleTheme', () => {
    it('should switch from light to dark and apply the dark mode class', () => {
      const service = new ThemeService();
      service.toggleTheme();
      expect(service.theme()).toBe('dark');
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('should switch from dark to light and remove the dark mode class', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      const service = new ThemeService();
      service.toggleTheme();
      expect(service.theme()).toBe('light');
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    });
  });
});