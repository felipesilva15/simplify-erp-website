import { Injectable } from '@angular/core';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Injectable({
  providedIn: 'root',
})
export class DateUtilsService {
  parseIsoDates<T>(data: T): T {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => {
        if (typeof value === 'string' && ISO_DATE_PATTERN.test(value)) {
          const [year, month, day] = value.split('-').map(Number);
          return [key, new Date(year, month - 1, day)];
        }

        return [key, value];
      })
    ) as unknown as T;
  }

  formatIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}