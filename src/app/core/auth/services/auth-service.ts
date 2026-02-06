import { ApiResponse } from './../../models/api-response';
import { LoginRequest } from './../../../features/security/auth/models/login-request';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenDetails } from '../../models/token-details';
import { environment } from '../../../../environments/environment';
import { User } from '../../../features/security/users/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.baseUrlApi}/security/auth`;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) { }

  login (data: LoginRequest): Observable<TokenDetails> {
    return this.http.post<TokenDetails>(`${this.baseUrl}/login`, data, {
      withCredentials: true
    });
  }

  loadUser(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<User>(`${this.baseUrl}/me`, {
        withCredentials: true
      }).subscribe({
        next: (response: User) => {
          this.userSubject.next(response);
          resolve();
        },
        error: () => {
          this.userSubject.next(null);
          resolve();
        }
      });
    });
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }
}
