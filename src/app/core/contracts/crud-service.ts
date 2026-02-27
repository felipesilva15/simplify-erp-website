import { Observable } from "rxjs";
import { ApiResponse } from "../models/api-response";
import { ListQueryParams } from "../types/list-query-params";

export interface CrudService<T> {
    list(params?: ListQueryParams<T>): Observable<ApiResponse<T[]>>;
    get(id: number): Observable<ApiResponse<T>>;
    edit(id: number): Observable<ApiResponse<T>>;
    create(payload: Partial<T>): Observable<ApiResponse<T>>;
    update(id: number, payload: Partial<T>): Observable<ApiResponse<T>>;
    delete(id: number): Observable<void>;
}
