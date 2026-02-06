import { LoginRequest } from './../../../features/security/auth/models/login-request';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TokenDetails } from '../../models/token-details';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.baseUrlApi}/security/auth`;

  constructor(private http: HttpClient) { }

  login (data: LoginRequest): Observable<TokenDetails> {
    return this.http.post<TokenDetails>(`${this.baseUrl}/login`, data);
  }
}
