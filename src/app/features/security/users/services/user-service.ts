import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { CreateUserRequestData } from '../models/create-user-request-data';
import { ApiResponse } from '../../../../core/models/api-response';
import { UpdateUserRequestData } from '../models/update-user-request-data';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl: string = environment.baseUrlApi + '/security/users';
  
  private http = inject(HttpClient)

  list(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}`, { withCredentials: true });
  }

  get(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  create(data: CreateUserRequestData): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}`, data, { withCredentials: true });
  }

  update(id: number, data: UpdateUserRequestData): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, data, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}
