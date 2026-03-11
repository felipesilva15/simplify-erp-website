import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpQueryBuilderService {
  buildHttpParams(obj?: any, prefix?: string, params: HttpParams = new HttpParams()): HttpParams {
    if (!obj) {
      return params;
    }
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const paramKey = prefix ? `${prefix}[${key}]` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        params = this.buildHttpParams(value, paramKey, params);
      } else {
        params = params.append(paramKey, value);
      }
    });

    return params;
  }
}
