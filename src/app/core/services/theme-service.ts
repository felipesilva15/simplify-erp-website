import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';
  private readonly DARK_MODE_CLASS = 'dark-mode';
  private readonly DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

  theme = signal<AppTheme>('light');

  constructor() {
    this.apply(this.resolveInitialTheme());
  }

  toggleTheme(): void {
    this.apply(this.theme() === 'light' ? 'dark' : 'light');
  }

  private resolveInitialTheme(): AppTheme {
    const storedTheme = localStorage.getItem(this.STORAGE_KEY);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return window.matchMedia(this.DARK_MODE_QUERY).matches ? 'dark' : 'light';
  }

  private apply(theme: AppTheme): void {
    this.theme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    document.documentElement.classList.toggle(this.DARK_MODE_CLASS, theme === 'dark');
  }
}